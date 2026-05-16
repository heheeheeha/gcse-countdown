let prevStates={};

const MFL_SUBJECTS = ["French", "German", "Spanish", "Italian", "Chinese"];

const HALF_TERM_START = new Date(2026, 4, 23, 0, 0, 0, 0); 
const CATEGORIES = [
    { name: "Essentials",    subjects: ["Biology", "Chemistry", "Physics", "Mathematics", "English Language", "English Literature"] },
    { name: "MFL",             subjects: ["French", "German", "Spanish", "Italian", "Chinese"] },
    { name: "Classics",    subjects: ["Latin", "Classical Greek", "Ancient History"] },
    { name: "Humanities",subjects: ["History", "Geography", "Religious Studies"] },
    { name: "Creatives",    subjects: ["Music", "Drama", "Art", "Electronics", "S&C / PD", "Computer Science"] },
];

const COURSEWORK = {
    "S&C / PD": 50,
    "Electronics": 20,
    "History": 30,
    "Music": 60,
    "Art": 100,
    "Drama": 60,
};

const FILTERS_KEY = 'filters_v3';
const DISPLAY_MODE_KEY = 'display_mode_v1';
const LEGACY_CAL_KEY = 'legacy_calendar_mode';
const LIGHT_KEY = 'light_mode';
const PLANNER_KEY = 'planner';
const SPEAKING_KEY = 'speaking_dates_v1';
const HIDE_MENUS_KEY = 'hide_menus';
const SHOW_OTHER_EXAMS_KEY = 'show_other_exams';
const SHOW_ONGOING_EXAMS_KEY = 'show_ongoing_exams';
const TOPBAR_KEY = 'topbar_hidden';
const WEEKENDS_KEY = 'hide_weekends';
const FILTER_COLLAPSED_KEY = 'filter_collapsed';
const ADVANCED_KEY = 'advanced_options';
const HIDE_APRIL_KEY = 'hide_april';
const HIDE_ASSISTANT_KEY = 'hide_assistant';
const SEA_EFFECT_KEY = 'sea_effect';
const FINISHED_EXAMS_KEY = 'finished_exams';
const SELECTED_CIRCLE_KEY = 'selected_progress_circle';

const DISPLAY_MODE_DEFAULT = 0;
const DISPLAY_MODE_COMPACT = 1;
const DISPLAY_MODE_CALENDAR = 2;
const DISPLAY_MODE_PROGRESS = 3;
const DISPLAY_MODE_ASSISTANT = 4;

const SETTINGS_CONFIG = {
    [HIDE_MENUS_KEY]: { type: 'bool', default: false },
    [SHOW_OTHER_EXAMS_KEY]: { type: 'bool', default: false },
    [SHOW_ONGOING_EXAMS_KEY]: { type: 'bool', default: true },
    [WEEKENDS_KEY]: { type: 'bool', default: true },
    [DISPLAY_MODE_KEY]: { type: 'int', default: DISPLAY_MODE_DEFAULT },
    [LEGACY_CAL_KEY]: { type: 'bool', default: false },
    [LIGHT_KEY]: { type: 'bool', default: false },
    [TOPBAR_KEY]: { type: 'bool', default: false },
    [FILTER_COLLAPSED_KEY]: { type: 'bool', default: false },
    [FILTERS_KEY]: { type: 'set', default: new Set() },
    [PLANNER_KEY]: { type: 'json', default: null },
    [SPEAKING_KEY]: { type: 'json', default: {} },
    [ADVANCED_KEY]: {type: 'bool', default: false},
    [HIDE_APRIL_KEY]: { type: 'bool', default: false },
    [SEA_EFFECT_KEY]: { type: 'bool', default: true },
    [FINISHED_EXAMS_KEY]: { type: 'set', default: new Set() },
    [SELECTED_CIRCLE_KEY]: { type: 'string', default: 'progress' },
};

function load(key, defaultValue = undefined) {
    const config = SETTINGS_CONFIG[key];
    const def = defaultValue !== undefined ? defaultValue : (config?.default ?? false);
    
    try {
        const val = localStorage.getItem(key);
        if (val === null) return def;
        
        if (config?.type === 'bool') {
            return val === '1';
        } else if (config?.type === 'int') {
            return parseInt(val, 10);
        } else if (config?.type === 'json') {
            return JSON.parse(val);
        } else if (config?.type === 'set') {
            return new Set(JSON.parse(val));
        }
        return val;
    } catch (e) {
        console.log(e);
        return def;
    }
}

function save(key, value) {
    try {
        const config = SETTINGS_CONFIG[key];
        
        if (config?.type === 'bool') {
            localStorage.setItem(key, value ? '1' : '0');
        } else if (config?.type === 'int') {
            localStorage.setItem(key, String(value));
        } else if (config?.type === 'set' && value instanceof Set) {
            localStorage.setItem(key, JSON.stringify([...value]));
        } else if (config?.type === 'json' || typeof value === 'object') {
            localStorage.setItem(key, JSON.stringify(value));
        } else {
            localStorage.setItem(key, value);
        }
    } catch (e) {}
}

function makeStart(dateStr, session) {
    const [d,m]=dateStr.split('/').map(Number);
    let hours,minutes;
    if(session==='AM'||session==='PM'){hours=session==='AM'?9:13;minutes=session==='AM'?15:30;}
    else [hours,minutes]=session.split(':');
    return new Date(2026,m-1,d,+hours,+minutes,0,0);
}

const SEA_OFF_TARGET = -0.25;

function fmtDuration(min){const h=Math.floor(min/60),m=min%60;if(!h)return`${m}m`;if(!m)return`${h}h`;return`${h}h ${m}m`;}
function fmtTime(d){return`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;}
function getState(start,end,now){if(now<start)return'upcoming';if(now<end)return'inprogress';return'over';}
function getFrac(ms){return Math.max(0,Math.min(1,ms/86400000/MAX_DAYS));}
function fracToColor(f){
    if(f<=0)return'rgb(239,68,68)';if(f>=1)return'rgb(34,197,94)';
    if(f<0.5){const t=f/0.5;return`rgb(239,${Math.round(68+115*t)},${Math.round(68*(1-t))})`;}
    const t=(f-0.5)/0.5;return`rgb(${Math.round(234-200*t)},${Math.round(179+18*t)},${Math.round(8+86*t)})`;
}

function fmtCountdown(ms){
    if(ms<=0)return'00d 00h 00m 00s';
    const d=Math.floor(ms/86400000),h=Math.floor((ms%86400000)/3600000),
                m=Math.floor((ms%3600000)/60000),s=Math.floor((ms%60000)/1000);
    return`${String(d).padStart(2,'0')}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
}

function makeCountdownBlock(ex, state, now, color, barId) {
    const msUntilStart = ex.start - now;
    const msUntilEnd = ex.end - now;
    const timerText = state === 'upcoming'
        ? fmtCountdown(msUntilStart)
        : state === 'inprogress'
            ? `Ends in ${fmtCountdown(msUntilEnd)}`
            : '–';
    const duration = ex.end - ex.start;
    const barFraction = state === 'upcoming'
        ? getFrac(msUntilStart)
        : state === 'inprogress'
            ? Math.max(0, Math.min(1, msUntilEnd / duration))
            : 0;
    const barColor = state === 'upcoming'
        ? fracToColor(getFrac(msUntilStart))
        : color;
    const barStyle = `width:${(barFraction * 100).toFixed(3)}%;background:${barColor}`;
    return `<div class="countdown-block">
            <span class="countdown-timer" data-code="${barId}">${timerText}</span>
            <div class="progress-wrap"><div class="progress-bar" data-bar="${barId}" style="${barStyle}"></div></div>
        </div>`;
}

function buildSpeakingExams() {
    const result = [];
            const saved = load(SPEAKING_KEY);
    MFL_SUBJECTS.forEach(subj => {
        const entry = saved[subj];
        if (!entry) return;
                let dateStr, timeStr;
        if (typeof entry === 'string') {
            dateStr = entry;
            timeStr = '09:00';
        } else if (typeof entry === 'object' && entry.date) {
            dateStr = entry.date;
            timeStr = entry.time || '09:00';
        } else {
            return;
        }

                let dd, mm, yyyy = 2026;
        if (dateStr.includes('-')) {
            const parts = dateStr.split('-').map(Number);
            if (parts.length === 3) { yyyy = parts[0]; mm = parts[1]; dd = parts[2]; }
            else return;
        } else if (dateStr.includes('/')) {
            const parts = dateStr.split('/').map(Number);
            if (parts.length === 2) { dd = parts[0]; mm = parts[1]; }
            else return;
        } else return;

        if (!dd || !mm) return;
        const [hours, minutes] = (timeStr || '09:00').split(':').map(Number);
        const start = new Date(2026, mm-1, dd, Number.isFinite(hours) ? hours : 9, Number.isFinite(minutes) ? minutes : 0, 0, 0);
        const end = new Date(start.getTime() + 30*60000);                 let codePrefix = 'SPEAK';
        for (let i = 0; i < RAW_EXAMS.length; i++) {
            if (RAW_EXAMS[i].subject === subj) { codePrefix = RAW_EXAMS[i].code.split('/')[0]; break; }
        }

        if (!activeFilters.has(subj)) return;

        result.push({
            date: `${String(dd).padStart(2,'0')}/${String(mm).padStart(2,'0')}`,
            board: 'AQA',
            level: 'GCSE',
            code: `${codePrefix}/SH`,
            subject: subj,
            component: 'Speaking Exam',
            session: fmtTime(start),
            durationMin: 30,
            weight: 1,
            start, end,
            isSpeaking: true,
        });
    });
    return result;
}

const baseExams = RAW_EXAMS.map(e=>{
    const start=makeStart(e.date,e.session);
    const end=new Date(start.getTime()+e.durationMin*60000);
    return{...e,start,end};
}).sort((a,b)=>a.start-b.start);

let exams = baseExams.slice();

function rebuildExams() {
    const speaking = buildSpeakingExams();
    exams = [...baseExams, ...speaking].sort((a,b)=>a.start-b.start);
        exams.forEach(e=>{ if(!(e.code in prevStates)) prevStates[e.code]=getState(e.start,e.end,Date.now()); });
}

// Collect all subjects that actually appear in the data, plus coursework-only subjects
const ALL_SUBJECTS = [...new Set([...baseExams.map(e => e.subject), ...Object.keys(COURSEWORK)])];

let activeFilters=load(FILTERS_KEY) || [];
let lastFilterCount = activeFilters.size;
activeFilters.forEach(s=>{if(!ALL_SUBJECTS.includes(s))activeFilters.delete(s);});

let legacyCalMode = load(LEGACY_CAL_KEY);
let displayMode = load(DISPLAY_MODE_KEY, DISPLAY_MODE_DEFAULT);

if (displayMode === DISPLAY_MODE_CALENDAR) {
    document.body.classList.add('cal');
} else if (displayMode === DISPLAY_MODE_COMPACT) {
    document.body.classList.add('compact');
} else if (displayMode === DISPLAY_MODE_PROGRESS) {
    document.body.classList.add('progress');
}

let lightMode = load(LIGHT_KEY);

let weekends = load(WEEKENDS_KEY);

let showOtherExams = load(SHOW_OTHER_EXAMS_KEY);
let showOngoingExams = load(SHOW_ONGOING_EXAMS_KEY);

let hideApril = load(HIDE_APRIL_KEY);
let seaEffectEnabled = load(SEA_EFFECT_KEY);

let selectedProgressCircle = load(SELECTED_CIRCLE_KEY, 'progress'); // 'progress', 'hours', 'exams'

let plannerMode = 0;
let currentFiltered = exams.slice();

const clearBtnWrap = document.getElementById('clearBtnWrap');
const filterCountEl = document.getElementById('filterCount');
const defaultbtn = document.getElementById('defaultbtn');
const compactbtn = document.getElementById('compactbtn');
const calbtn = document.getElementById('calbtn');
const progressbtn = document.getElementById('progressbtn');
const toggleMenusBtn = document.getElementById('toggleMenusBtn');
const assistantmodebtn = document.getElementById('assistantmodebtn');
const assistantPanel = document.getElementById('assistantPanel');
const quickLinksMenu = document.querySelector('.quick-links-menu');
const countdownsMenu = document.querySelector('.countdowns-menu');
const legacyCalToggle = document.getElementById('legacyCalToggle');
const filterCatsEl = document.getElementById('filterCategories');
const plannerbtn = document.getElementById('rev-planner');
const speakingDatesEl = document.getElementById('speakingDates');
const advancedOptsBtn = document.getElementById('advanced-btn');
const printBtn = document.getElementById('printBtn');

const lightToggleTop = document.getElementById('lightToggleTop');
const showOtherExamsToggle = document.getElementById('showOtherExamsToggle');
const showOngoingExamsToggle = document.getElementById('showOngoingExamsToggle');
const showOngoingExamsWrapper = document.getElementById('showOngoingExamsWrapper');
const calModeOnly = document.querySelectorAll('.calModeOnly');
const weekendsToggle = document.getElementById('weekendsToggle');
const hideAprilToggle = document.getElementById('hideAprilToggle');
const seaEffectToggle = document.getElementById('seaEffectToggle');
if (weekendsToggle) weekendsToggle.addEventListener('change', e => setWeekends(e.target.checked));

let advancedToggle = load(ADVANCED_KEY);
let seaCanvas = null;
let seaCtx = null;
let seaAnimationId = null;
let seaProgressPercent = 0;   // target progress (0–100)
let seaDisplayPercent = null; // currently rendered progress (lerps toward target); null = uninitialised
let seaWaveOffset = 0;
let seaLastFrameTime = 0;

function syncAllToggles() {
    const isLight = document.documentElement.classList.contains('light');
    if (lightToggleTop) lightToggleTop.checked = isLight;
    
    if (legacyCalToggle) legacyCalToggle.checked = legacyCalMode;
    if (showOtherExamsToggle) showOtherExamsToggle.checked = showOtherExams;
    if (showOngoingExamsToggle) showOngoingExamsToggle.checked = showOngoingExams;
    if (seaEffectToggle) seaEffectToggle.checked = seaEffectEnabled;
    if (weekendsToggle) weekendsToggle.checked = weekends;
    if (hideAprilToggle) hideAprilToggle.checked = hideApril;

    if (calModeOnly) {
        calModeOnly.forEach((el) => {el.style.display = (displayMode === DISPLAY_MODE_CALENDAR && advancedToggle) ? 'flex' : 'none'});
    }
    
    if(defaultbtn) defaultbtn.classList.toggle('active', displayMode === DISPLAY_MODE_DEFAULT);
    if(compactbtn) compactbtn.classList.toggle('active', displayMode === DISPLAY_MODE_COMPACT);
    if(calbtn) calbtn.classList.toggle('active', displayMode === DISPLAY_MODE_CALENDAR);
    if(progressbtn) progressbtn.classList.toggle('active', displayMode === DISPLAY_MODE_PROGRESS);
    if(assistantmodebtn) assistantmodebtn.classList.toggle('active', displayMode === DISPLAY_MODE_ASSISTANT);
}

syncAllToggles();

const progressContainer = document.getElementById('progressTrackerContainer');
if (progressContainer && displayMode === DISPLAY_MODE_PROGRESS) {
    progressContainer.style.display = 'block';
}

function setLightMode(on) {
    document.documentElement.classList.toggle('light', on);
    document.documentElement.classList.toggle('dark', !on);
    if (lightToggleTop) lightToggleTop.checked = on;
    lightMode = on ? 1 : 0;
    save(LIGHT_KEY, lightMode);
}

if (lightToggleTop) lightToggleTop.addEventListener('change', e => setLightMode(e.target.checked));

function setShowOtherExams(on) {
    showOtherExams = on ? 1 : 0;
    if (showOtherExamsToggle) showOtherExamsToggle.checked = on;
    save(SHOW_OTHER_EXAMS_KEY, showOtherExams);
    renderExams();
}

function setShowOngoingExams(on) {
    showOngoingExams = on ? 1 : 0;
    if (showOngoingExamsToggle) showOngoingExamsToggle.checked = on;
    save(SHOW_ONGOING_EXAMS_KEY, showOngoingExams);
    renderExams();
}

if (showOngoingExamsToggle) showOngoingExamsToggle.addEventListener('change', e => setShowOngoingExams(e.target.checked));
if (seaEffectToggle) seaEffectToggle.addEventListener('change', e => setSeaEffect(e.target.checked));

function getProgressPercent() {
    const now = Date.now();
    const allExams = activeFilters.size === 0 ? exams : (currentFiltered || exams);
    const subjectStats = {};

    allExams.forEach(e => {
        const w = Number(e.weight) || 1;
        if (!subjectStats[e.subject]) {
            subjectStats[e.subject] = { totalWeight: 0, completedWeight: 0 };
        }
        subjectStats[e.subject].totalWeight += w;
        if (getState(e.start, e.end, now) === 'over') {
            subjectStats[e.subject].completedWeight += w;
        }
    });

    Object.keys(COURSEWORK).forEach(subject => {
        if ((activeFilters.size === 0 || activeFilters.has(subject)) && !subjectStats[subject]) {
            subjectStats[subject] = { totalWeight: 0, completedWeight: 0 };
        }
    });

    MFL_SUBJECTS.forEach(subject => {
        if (activeFilters.size === 0 || activeFilters.has(subject)) {
            if (!subjectStats[subject]) {
                subjectStats[subject] = { totalWeight: 0, completedWeight: 0 };
            }
            const hasSpeakingExam = allExams.some(e => e.subject === subject && e.isSpeaking);
            if (!hasSpeakingExam) {
                subjectStats[subject].completedWeight = Math.min(subjectStats[subject].completedWeight + 1, 4);
            }
            subjectStats[subject].totalWeight = 4;
        }
    });

    const subjects = Object.keys(subjectStats);
    if (!subjects.length) return 0;

    let overallFrac = 0;
    subjects.forEach(subject => {
        const stats = subjectStats[subject];
        const cwPct = COURSEWORK[subject] || 0;
        const writtenPct = 100 - cwPct;
        const writtenDoneFrac = stats.totalWeight > 0 ? (stats.completedWeight / stats.totalWeight) : 0;
        const subjectFrac = (cwPct + writtenDoneFrac * writtenPct) / 100;
        overallFrac += subjectFrac / subjects.length;
    });

    return Number((overallFrac * 100).toFixed(1));
}


function updateSeaHeight(percent) {
    seaProgressPercent = Number(percent) || 0;
    const seaEl = document.getElementById('seaBackground');
    if (seaEl && seaCanvas) resizeSeaCanvas();
}

function refreshSeaFromSelectedCircle() {
    if (seaEffectEnabled) {
        seaProgressPercent = getSeaTargetPercent();
    }
}

function resizeSeaCanvas() {
    const seaEl = document.getElementById('seaBackground');
    if (!seaEl || !seaCanvas || !seaCtx) return;
    const rect = seaEl.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    seaCanvas.width = rect.width * ratio;
    seaCanvas.height = rect.height * ratio;
    seaCanvas.style.width = `${rect.width}px`;
    seaCanvas.style.height = `${rect.height}px`;
    seaCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawWave(layer, width, height, amplitude, offset, color, opacity, progress) {
    const yBase = height * ((1 - progress) + layer * 0.05);
    seaCtx.beginPath();
    seaCtx.moveTo(0, height);
    seaCtx.lineTo(0, yBase);
    for (let x = 0; x <= width; x += 12) {
        const theta = (x / width) * Math.PI * 2 * (1 + layer * 0.25) + offset;
        const y = yBase + Math.sin(theta + layer) * amplitude * (1 - layer * 0.14);
        seaCtx.lineTo(x, y);
    }
    seaCtx.lineTo(width, height);
    seaCtx.closePath();
    seaCtx.fillStyle = `rgba(${color}, ${opacity})`;
    seaCtx.fill();
}

function drawSeaFrame(dt) {
    if (!seaCanvas || !seaCtx) return;
    const width  = seaCanvas.clientWidth;
    const height = seaCanvas.clientHeight;
    seaCtx.clearRect(0, 0, width, height);

    // Target: if the effect is enabled, use real progress; otherwise sink off-screen.
    const targetPercent = seaEffectEnabled
        ? seaProgressPercent
        : SEA_OFF_TARGET * 100;   // convert fraction → percent-space

    // Initialise display on first frame.
    if (seaDisplayPercent === null) {
        seaDisplayPercent = seaEffectEnabled ? targetPercent : SEA_OFF_TARGET * 100;
    }

    // Smooth lerp — speed ~55 % of the gap per second, giving a silky ease-out.
    const lerpSpeed = 5;   // higher = faster
    const alpha = 1 - Math.exp(-lerpSpeed * dt);
    seaDisplayPercent += (targetPercent - seaDisplayPercent) * alpha;

    const progress = (seaDisplayPercent / 100) + 0.05;
    const amplitude = 8 + Math.max(0, progress) * 18;

    // Colour depends on which circle is selected
    const SEA_COLORS = {
        progress: lightMode ? '59,7,100'   : '126,58,158',  // purple
        hours:    lightMode ? '14,116,144'  : '6,148,162',   // teal/cyan
        exams:    lightMode ? '22,101,52'   : '21,128,61',   // green
    };
    const baseColor = SEA_COLORS[selectedProgressCircle] || SEA_COLORS.progress;

    seaWaveOffset += 0.02 + randomInRange(0, 0.01);

    drawWave(0, width, height, amplitude * 0.9, seaWaveOffset + randomInRange(0, 0.01), baseColor, 0.42, progress);
    drawWave(1, width, height, amplitude * 0.72, seaWaveOffset - randomInRange(0, 0.01) * 1.18, baseColor, 0.32, progress);
    drawWave(2, width, height, amplitude * 0.5, seaWaveOffset + randomInRange(0, 0.02) * 1.42, baseColor, 0.24, progress);

    // Once the sea has fully sunk off-screen and the effect is disabled, stop animating.
    if (!seaEffectEnabled && seaDisplayPercent <= SEA_OFF_TARGET * 100 + 0.2) {
        cancelAnimationFrame(seaAnimationId);
        seaAnimationId = null;
        window.removeEventListener('resize', resizeSeaCanvas);
        if (seaCanvas && seaCanvas.parentNode) seaCanvas.parentNode.removeChild(seaCanvas);
        seaCanvas = null;
        seaCtx = null;
    }
}

function renderSeaWave(timestamp) {
    const dt = seaLastFrameTime ? Math.min((timestamp - seaLastFrameTime) / 1000, 0.1) : 0.016;
    seaLastFrameTime = timestamp;
    drawSeaFrame(dt);
    if (seaCanvas) seaAnimationId = requestAnimationFrame(renderSeaWave);
}

function createSeaCanvas() {
    const seaEl = document.getElementById('seaBackground');
    if (!seaEl || seaCanvas) return;
    seaCanvas = document.createElement('canvas');
    seaCanvas.id = 'seaCanvas';
    seaCanvas.style.position = 'absolute';
    seaCanvas.style.left = '0';
    seaCanvas.style.top = '0';
    seaCanvas.style.width = '100%';
    seaCanvas.style.height = '100%';
    seaCanvas.style.pointerEvents = 'none';
    seaCanvas.style.opacity = '0.95';
    seaCanvas.style.zIndex = '0';
    seaEl.appendChild(seaCanvas);
    seaCtx = seaCanvas.getContext('2d');
    resizeSeaCanvas();
    window.addEventListener('resize', resizeSeaCanvas);
    seaLastFrameTime = 0;
    seaAnimationId = requestAnimationFrame(renderSeaWave);
}

function getSeaTargetPercent() {
    const now = Date.now();
    const allExams = activeFilters.size === 0 ? exams : (currentFiltered || exams);

    if (selectedProgressCircle === 'hours') {
        const totalMin = allExams.reduce((sum, e) => sum + (Number(e.durationMin) || 0), 0);
        const doneMin  = allExams.filter(e => getState(e.start, e.end, now) === 'over')
                                 .reduce((sum, e) => sum + (Number(e.durationMin) || 0), 0);
        return totalMin > 0 ? (doneMin / totalMin) * 100 : 0;
    } else if (selectedProgressCircle === 'exams') {
        const totalCount = allExams.length;
        const doneCount  = allExams.filter(e => getState(e.start, e.end, now) === 'over').length;
        return totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
    } else {
        return getProgressPercent();
    }
}

function setSeaEffect(on) {
    seaEffectEnabled = Boolean(on);
    if (seaEffectToggle) seaEffectToggle.checked = seaEffectEnabled;
    document.documentElement.classList.toggle('sea-effect-enabled', seaEffectEnabled);
    save(SEA_EFFECT_KEY, seaEffectEnabled);

    if (seaEffectEnabled) {
        // Rise up from below: start display at off-screen position, then lerp up.
        if (!seaCanvas) {
            seaDisplayPercent = SEA_OFF_TARGET * 100;
            createSeaCanvas();
        }
        seaProgressPercent = getSeaTargetPercent();
    } else {
        // Just set the target to off-screen; the render loop will animate the sink
        // and then clean up the canvas itself once fully gone.
        if (seaCanvas && !seaAnimationId) {
            seaLastFrameTime = 0;
            seaAnimationId = requestAnimationFrame(renderSeaWave);
        }
    }
}

function setWeekends(on) {
    weekends = on ? 1 : 0;
    const weekendsToggle = document.getElementById('weekendsToggle');
    if (weekendsToggle) weekendsToggle.checked = on;
    save(WEEKENDS_KEY, weekends);
    const calendarTable = document.getElementById('calendar');
    const multiCalendar = document.querySelector('.continuous-calendar');
    if (on) {
        if (calendarTable) calendarTable.classList.add('hide-weekends');
        if (multiCalendar) multiCalendar.classList.add('hide-weekends');
    } else {
        if (calendarTable) calendarTable.classList.remove('hide-weekends');
        if (multiCalendar) multiCalendar.classList.remove('hide-weekends');
    }
    renderExams();
}

if (showOtherExamsToggle) {
    showOtherExamsToggle.addEventListener('change', e => setShowOtherExams(e.target.checked));
}

function setHideApril(on) {
    hideApril = on ? 1 : 0;
    if (hideAprilToggle) hideAprilToggle.checked = on;
    save(HIDE_APRIL_KEY, hideApril);
    renderExams();
}

if (hideAprilToggle) {
    hideAprilToggle.addEventListener('change', e => setHideApril(e.target.checked));
}

function updatePrintBtnVisibility() {
    if (!printBtn) return;
    // just let them print everything
    // const hidden = displayMode === DISPLAY_MODE_PROGRESS || displayMode === DISPLAY_MODE_ASSISTANT;
    //     printBtn.disabled = hidden;
}

function doPrint() {
        document.documentElement.classList.add('print-force-light');
    printBtn.style.display = "none";
    window.print();
    printBtn.style.display = "";
}

if (printBtn) {
    printBtn.addEventListener('click', doPrint);
}
    

function setLegacyCalMode(on) {
    legacyCalMode = on ? 1 : 0;
    if (legacyCalToggle) legacyCalToggle.checked = on;
    if (displayMode !== DISPLAY_MODE_CALENDAR) setDisplayMode(DISPLAY_MODE_CALENDAR);
    
        if (hideAprilToggle) {
        const hideAprilWrapper = document.getElementById('hideAprilWrapper');
        if (hideAprilWrapper) {
            hideAprilWrapper.style.display = (displayMode === DISPLAY_MODE_CALENDAR && advancedToggle && !legacyCalMode) ? 'flex' : 'none';
        }
    }
    
    save(LEGACY_CAL_KEY, legacyCalMode);
    renderExams();
}
if (legacyCalToggle) {
    legacyCalToggle.addEventListener('change', e => {
        setLegacyCalMode(e.target.checked);
    });
}

function setDisplayMode(newMode) {
    displayMode = newMode;
    
        document.body.classList.remove('compact', 'cal', 'multical', 'progress');
    
        if(defaultbtn) defaultbtn.classList.remove('active');
    if(compactbtn) compactbtn.classList.remove('active');
    if(calbtn) calbtn.classList.remove('active');
    if(progressbtn) progressbtn.classList.remove('active');
    if(assistantmodebtn) assistantmodebtn.classList.remove('active');

    document.getElementById('examList').style.display = '';
    
        if (assistantPanel) assistantPanel.style.display = (newMode === DISPLAY_MODE_ASSISTANT) ? '' : 'none';
    
        switch (displayMode) {
        case DISPLAY_MODE_COMPACT:
            console.log(advancedToggle)
            document.getElementById("showOngoingExamsWrapper").style.display = advancedToggle ? "" : "none";
            document.body.classList.add('compact');
            if(compactbtn) compactbtn.classList.add('active');
            if(progressContainer) progressContainer.style.display = 'none';
            break;
        case DISPLAY_MODE_CALENDAR:
            document.body.classList.add('cal');
            document.getElementById("showOngoingExamsWrapper").style.display = "none";
            if(calbtn) calbtn.classList.add('active');
            if(progressContainer) progressContainer.style.display = 'none';
            break;
        case DISPLAY_MODE_PROGRESS:
            document.body.classList.add('progress');
            document.getElementById("showOngoingExamsWrapper").style.display = "none";
            if(progressbtn) progressbtn.classList.add('active');
            if(progressContainer) progressContainer.style.display = 'block';
            renderProgressTracker();
            break;
        case DISPLAY_MODE_ASSISTANT:
            if(assistantmodebtn) assistantmodebtn.classList.add('active');
            if(progressContainer) progressContainer.style.display = 'none';
            document.getElementById('examList').style.display = 'none'; 
            document.getElementById("showOngoingExamsWrapper").style.display = "none";
            break;
        case DISPLAY_MODE_DEFAULT:
        default:
            document.getElementById("showOngoingExamsWrapper").style.display = advancedToggle ? "" : "none";
            if(defaultbtn) defaultbtn.classList.add('active');
            if(progressContainer) progressContainer.style.display = 'none';
    }
        if (calModeOnly) {
        calModeOnly.forEach((el) => {
            if (el.id === 'hideAprilWrapper') {
                el.style.display = (displayMode === DISPLAY_MODE_CALENDAR && advancedToggle && !legacyCalMode) ? 'flex' : 'none';
            } else {
                el.style.display = (displayMode === DISPLAY_MODE_CALENDAR && advancedToggle) ? 'flex' : 'none';
            }
        });
    }
    
        save(DISPLAY_MODE_KEY, displayMode);
    updatePrintBtnVisibility();
    renderExams();
}

function setDefaultMode(on) {
    if (on) setDisplayMode(DISPLAY_MODE_DEFAULT);
}

function setCompactMode(on) {
    setDisplayMode(on ? DISPLAY_MODE_COMPACT : DISPLAY_MODE_DEFAULT);
}

function setCalMode(on) {
    setDisplayMode(on ? DISPLAY_MODE_CALENDAR : DISPLAY_MODE_DEFAULT);
}

function setProgressMode(on) {
    setDisplayMode(on ? DISPLAY_MODE_PROGRESS : DISPLAY_MODE_DEFAULT);
}


function setAssistantMode(on) {
    setDisplayMode(on ? DISPLAY_MODE_ASSISTANT : DISPLAY_MODE_DEFAULT);
}

if (assistantmodebtn) assistantmodebtn.addEventListener('click', () => setAssistantMode(displayMode !== DISPLAY_MODE_ASSISTANT));

if (assistantPanel) {
    assistantPanel.style.display = (displayMode === DISPLAY_MODE_ASSISTANT) ? '' : 'none'
    if (displayMode == DISPLAY_MODE_ASSISTANT) { document.getElementById('examList').style.display = 'none'; }
};

if (calbtn) calbtn.addEventListener('click', () => setCalMode(displayMode !== DISPLAY_MODE_CALENDAR));
if (compactbtn) compactbtn.addEventListener('click', () => setCompactMode(displayMode !== DISPLAY_MODE_COMPACT));
if (progressbtn) progressbtn.addEventListener('click', () => setProgressMode(displayMode !== DISPLAY_MODE_PROGRESS));
if (defaultbtn) defaultbtn.addEventListener('click', () => setDefaultMode(true));

function setAdvancedToggle(on) {
    if (!on) {
        console.log("inactive");
        advancedToggle = false;
        advancedOptsBtn.classList.remove("cat-active");
        document.getElementById("legacyUI").style.display = "none";
        document.getElementById("legacyCal").style.display = "none";
        document.getElementById("showOtherExamsWrapper").style.display = "none";
        document.getElementById("hideWeekends").style.display = "none";
        document.getElementById("hideAprilWrapper").style.display = "none";
        document.getElementById("showOngoingExamsWrapper").style.display = "none";
        document.querySelector(".controls-settings-box").classList.add("expanded");
    } else {
        console.log("active");
        advancedToggle = true;
        advancedOptsBtn.classList.add("cat-active");
        document.getElementById("legacyUI").style = "";
        if (displayMode === DISPLAY_MODE_CALENDAR) {
            document.getElementById("legacyCal").style = "";
            document.getElementById("showOtherExamsWrapper").style = "";
            document.getElementById("hideWeekends").style = "";
            if (!legacyCalMode) {
                document.getElementById("hideAprilWrapper").style = "";
            }
        } 
        console.log((displayMode === DISPLAY_MODE_DEFAULT || displayMode === DISPLAY_MODE_COMPACT))
        document.getElementById("showOngoingExamsWrapper").style.display = (displayMode === DISPLAY_MODE_DEFAULT || displayMode === DISPLAY_MODE_COMPACT) ? "" : "none"; 
        document.querySelector(".controls-settings-box").classList.remove("expanded");
    }
    save(ADVANCED_KEY, advancedToggle);
}

advancedOptsBtn.addEventListener('click', () => {
    setAdvancedToggle(!advancedToggle);
});
document.addEventListener('keydown', (e) => {
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
    
    if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        doPrint();
        return
    }

    if (e.ctrlKey || e.altKey) {
        return;
    }
    
    if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        setDefaultMode(true);
    } else if (e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        setCompactMode(displayMode !== DISPLAY_MODE_COMPACT);
    } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setCalMode(displayMode !== DISPLAY_MODE_CALENDAR);
    } else if (e.key === 'a' || e.key === 'a') {
        e.preventDefault();
        setLegacyCalMode(!legacyCalMode);
    } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        const isLight = document.documentElement.classList.contains('light');
        setLightMode(!isLight);
    } else if (e.key === 'e' || e.key === 'E') {
        toggleMenusVisibility();
    } else if (e.key === 's' || e.key === 'S') {
        if (displayMode === DISPLAY_MODE_CALENDAR) {
            e.preventDefault();
            setShowOtherExams(!showOtherExams);
        } else if (displayMode === DISPLAY_MODE_DEFAULT || displayMode === DISPLAY_MODE_COMPACT) {
            e.preventDefault();
            setShowOngoingExams(!showOngoingExams);
        }
    } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setWeekends(!weekends);
    } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setHideApril(!hideApril);
    } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        setProgressMode(displayMode !== DISPLAY_MODE_PROGRESS);
    } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        setAssistantMode(displayMode !== DISPLAY_MODE_ASSISTANT);
    } else if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        setAdvancedToggle(!advancedToggle);
    } else if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        setSeaEffect(!seaEffectEnabled);
    } 
    
});

if (legacyCalMode && legacyCalToggle) legacyCalToggle.classList.add('active');

function getActiveMFLSubjects() {
    if (activeFilters.size === 0) return [];
    return MFL_SUBJECTS.filter(s => activeFilters.has(s));
}

function renderSpeakingDates() {
    speakingDatesEl.innerHTML = '';
    const mflActive = getActiveMFLSubjects();
    if (!mflActive.length) return;

    const saved = load(SPEAKING_KEY);

    const wrapper = document.createElement('div');
    wrapper.className = 'speaking-dates-wrapper';

    const header = document.createElement('div');
    header.className = 'speaking-dates-header';
    header.innerHTML = `<span class="speaking-dates-label"><i class="fas fa-microphone"></i> Speaking Exam Dates</span>
        <span class="speaking-dates-hint">Set your speaking exam date to add it to the list</span>`;
    wrapper.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'speaking-dates-grid';

    mflActive.forEach(subj => {
        const row = document.createElement('div');
        row.className = 'speaking-date-row';

        const label = document.createElement('label');
        label.className = 'speaking-date-label';
        label.textContent = subj;

        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.className = 'speaking-date-input';
        dateInput.dataset.subject = subj;
        dateInput.min = '2026-01-01';
        dateInput.max = '2026-12-31';

        const timeInput = document.createElement('input');
        timeInput.type = 'time';
        timeInput.className = 'speaking-time-input';
        timeInput.dataset.subject = subj;

                if (saved[subj]) {
            if (typeof saved[subj] === 'string') {
                                if (saved[subj].includes('-')) {
                    dateInput.value = saved[subj];                 } else if (saved[subj].includes('/')) {
                    const parts = saved[subj].split('/');
                    if (parts.length === 2) dateInput.value = `2026-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
                }
                timeInput.value = '09:00';
            } else if (typeof saved[subj] === 'object') {
                                if (saved[subj].date) {
                    if (saved[subj].date.includes('-')) {
                        dateInput.value = saved[subj].date;
                    } else if (saved[subj].date.includes('/')) {
                        const parts = saved[subj].date.split('/');
                        if (parts.length === 2) dateInput.value = `2026-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
                    }
                }
                timeInput.value = saved[subj].time || '09:00';
            }
        }

        function commit() {
            const val = (dateInput.value || '').trim();
            if (!val || !/^\d{4}-\d{2}-\d{2}$/.test(val)) return;
            const [yyyy, mm, dd] = val.split('-').map(Number);
            if (!dd || !mm || mm < 1 || mm > 12 || dd < 1 || dd > 31 || yyyy !== 2026) return;
            const newSaved = load(SPEAKING_KEY);
            newSaved[subj] = { date: val, time: timeInput.value || '09:00' };
            save(SPEAKING_KEY, newSaved);
            rebuildExams();
            renderExams();
        }

        dateInput.addEventListener('change', commit);
        timeInput.addEventListener('change', () => {
            if (dateInput.value) commit();
        });

                const clearBtn = document.createElement('button');
        clearBtn.className = 'speaking-date-clear';
        clearBtn.title = 'Clear date';
        clearBtn.innerHTML = '<i class="fas fa-times"></i>';
        clearBtn.style.display = dateInput.value ? '' : 'none';
        clearBtn.addEventListener('click', () => {
            dateInput.value = '';
            timeInput.value = '09:00';
            clearBtn.style.display = 'none';
            const newSaved = load(SPEAKING_KEY);
            delete newSaved[subj];
            save(SPEAKING_KEY, newSaved);
            rebuildExams();
            renderExams();
        });
        dateInput.addEventListener('input', () => {
            clearBtn.style.display = dateInput.value ? '' : 'none';
        });

        row.appendChild(label);
        row.appendChild(dateInput);
        row.appendChild(timeInput);
        row.appendChild(clearBtn);
        grid.appendChild(row);
    });

    wrapper.appendChild(grid);
    speakingDatesEl.appendChild(wrapper);
}

let clearRaf=null;
function setClearVisible(show){
    if(clearRaf){cancelAnimationFrame(clearRaf);clearRaf=null;}
    const wrap=clearBtnWrap;
    if(show){
        wrap.style.transition='none';
        wrap.style.height='auto';
        const h=wrap.scrollHeight;
        wrap.style.height='0';
        wrap.style.marginTop='0';
        wrap.offsetHeight;
        clearRaf=requestAnimationFrame(()=>{
            wrap.style.transition='height 0.35s cubic-bezier(0.25,0.46,0.45,0.94),margin-top 0.35s cubic-bezier(0.25,0.46,0.45,0.94)';
            wrap.style.height=h+'px';
            wrap.style.marginTop='12px';
            wrap.classList.add('open');
        });
    } else {
        wrap.style.transition='none';
        wrap.style.height=wrap.scrollHeight+'px';
        wrap.style.marginTop='12px';
        wrap.offsetHeight;
        clearRaf=requestAnimationFrame(()=>{
            wrap.style.transition='height 0.3s cubic-bezier(0.25,0.46,0.45,0.94),margin-top 0.3s cubic-bezier(0.25,0.46,0.45,0.94)';
            wrap.style.height='0';
            wrap.style.marginTop='0';
            wrap.classList.remove('open');
        });
    }
}

function updateClearBtn(){
    const current = activeFilters.size;
    if ((lastFilterCount === 0 && current > 0) ||
            (lastFilterCount > 0 && current === 0)) {
        setClearVisible(current > 0);
    }
    lastFilterCount = current;
}

function updateFilterCount(){
    const n=activeFilters.size;
    filterCountEl.innerHTML=`<strong>${n}</strong> selected`;
    filterCountEl.classList.toggle('visible',n>0);
}

const subjectBtnMap={};

function isCatFullyActive(subjects){
    const present=subjects.filter(s=>ALL_SUBJECTS.includes(s));
    return present.length>0 && present.every(s=>activeFilters.has(s));
}

function refreshCategoryLabels(){
    CATEGORIES.forEach(cat=>{
        const el=document.getElementById('catlabel-'+cat.name);
        if(!el)return;
        const present=cat.subjects.filter(s=>ALL_SUBJECTS.includes(s));
        if(!present.length)return;
        el.classList.toggle('cat-active', present.every(s=>activeFilters.has(s)));
    });
}

CATEGORIES.forEach(cat=>{
    const present=cat.subjects.filter(s=>ALL_SUBJECTS.includes(s));
    if(!present.length)return;

    const section=document.createElement('div');
    section.className='filter-category';

    const header=document.createElement('div');
    header.className='category-header';

    const labelBtn=document.createElement('button');
    labelBtn.className='category-label-btn';
    labelBtn.id='catlabel-'+cat.name;
    labelBtn.textContent=cat.name;
    labelBtn.title=`Select all ${cat.name}`;

    labelBtn.addEventListener('click',()=>{
        const allActive=present.every(s=>activeFilters.has(s));
        present.forEach(s=>{
            if(allActive){ activeFilters.delete(s); subjectBtnMap[s]&&subjectBtnMap[s].classList.remove('active'); }
            else                 { activeFilters.add(s);        subjectBtnMap[s]&&subjectBtnMap[s].classList.add('active'); }
        });
        refreshCategoryLabels();
        updateClearBtn(); updateFilterCount(); save(FILTERS_KEY, activeFilters); rebuildExams(); renderExams(); renderSpeakingDates();
    });

    const line=document.createElement('div');
    line.className='category-line';

    header.appendChild(labelBtn);
    header.appendChild(line);
    section.appendChild(header);

    const grid=document.createElement('div');
    grid.className='filter-grid';

    present.forEach(subj=>{
        const btn=document.createElement('button');
        btn.textContent=subj;
        btn.className='filter-btn'+(activeFilters.has(subj)?' active':'');
        subjectBtnMap[subj]=btn;
        btn.addEventListener('click',()=>{
            if(btn.classList.contains('active')){ btn.classList.remove('active'); activeFilters.delete(subj); }
            else { btn.classList.add('active'); activeFilters.add(subj); }
            refreshCategoryLabels();
            updateClearBtn(); updateFilterCount(); save(FILTERS_KEY, activeFilters); rebuildExams(); renderExams(); renderSpeakingDates();
        });
        grid.appendChild(btn);
    });

    section.appendChild(grid);
    filterCatsEl.appendChild(section);
});

refreshCategoryLabels();

document.getElementById('clearFilters').addEventListener('click',()=>{
    activeFilters.clear();
    Object.values(subjectBtnMap).forEach(b=>b.classList.remove('active'));
    refreshCategoryLabels();
    updateClearBtn(); updateFilterCount(); save(FILTERS_KEY, activeFilters); rebuildExams(); renderExams(); renderSpeakingDates();
});

function toggleMenusVisibility() {
        hideMenus = !hideMenus;
    if (quickLinksMenu) quickLinksMenu.classList.toggle('hidden', hideMenus);
    if (countdownsMenu) countdownsMenu.classList.toggle('hidden', hideMenus);
    if (hideMenusToggle) hideMenusToggle.checked = hideMenus;
    updateSidebarVisibility();
    save(HIDE_MENUS_KEY, hideMenus);
}

if (toggleMenusBtn) {
    toggleMenusBtn.addEventListener('click', toggleMenusVisibility);
}

const filterCollapseBtn = document.getElementById('filterCollapseBtn');
const hideMenusToggle = document.getElementById('hideMenusToggle');

let hideMenus = load(HIDE_MENUS_KEY);
function updateSidebarVisibility() {
    const sidebarCountdowns = document.getElementById('sidebarCountdownsWrapper');
    const sidebarLinks = document.getElementById('sidebarLinksWrapper');
    if (hideMenus) {
        if (quickLinksMenu) quickLinksMenu.classList.add('hidden');
        if (countdownsMenu) countdownsMenu.classList.add('hidden');
        if (sidebarCountdowns) sidebarCountdowns.style.display = '';
        if (sidebarLinks) sidebarLinks.style.display = '';
    } else {
        if (quickLinksMenu) quickLinksMenu.classList.remove('hidden');
        if (countdownsMenu) countdownsMenu.classList.remove('hidden');
        if (sidebarCountdowns) sidebarCountdowns.style.display = 'none';
        if (sidebarLinks) sidebarLinks.style.display = 'none';
    }
}

updateSidebarVisibility();

if (hideMenusToggle) {
    hideMenusToggle.checked = hideMenus;
    hideMenusToggle.addEventListener('change', (e) => {
        hideMenus = e.target.checked;
        updateSidebarVisibility();
        save(HIDE_MENUS_KEY, hideMenus);
    });
}
const filterCatsEl_ref = document.getElementById('filterCategories');
const speakingDatesEl_ref = document.getElementById('speakingDates');

function setFilterCollapsed(collapsed) {
    if (collapsed) {
        filterCatsEl_ref.classList.add('collapsed');
        speakingDatesEl_ref.classList.add('collapsed');
        filterCollapseBtn.classList.add('collapsed');
    } else {
        filterCatsEl_ref.classList.remove('collapsed');
        speakingDatesEl_ref.classList.remove('collapsed');
        filterCollapseBtn.classList.remove('collapsed');
    }
    save(FILTER_COLLAPSED_KEY, collapsed);
}

filterCollapseBtn.addEventListener('click', () => {
    const isCollapsed = filterCatsEl_ref.classList.contains('collapsed');
    setFilterCollapsed(!isCollapsed);
});

if (load(FILTER_COLLAPSED_KEY)) {
    setFilterCollapsed(true);
}

clearBtnWrap.style.transition='none';
clearBtnWrap.style.height=activeFilters.size>0?'auto':'0';
clearBtnWrap.style.marginTop=activeFilters.size>0?'12px':'0';
if(activeFilters.size>0)clearBtnWrap.classList.add('open');
updateFilterCount();

rebuildExams();
renderSpeakingDates();

const topBar = document.querySelector('.top-bar');
const topBarClose = document.getElementById('topBarClose');
if (load(TOPBAR_KEY)) {
    if (topBar) topBar.style.display = 'none';
}
if (topBarClose) {
    topBarClose.addEventListener('click', () => {
        if (topBar) topBar.style.display = 'none';
        save(TOPBAR_KEY, true);
    });
}


let monthOffset = 0;

function renderMultiMonthCalendar(list, active, filtered) {
    const wrapper = document.createElement('div');
    wrapper.className = 'multi-calendar-wrapper';

        let allExamsForCalendar = activeFilters.size === 0 ? exams : exams.filter(e => activeFilters.has(e.subject));
    
        let otherExams = [];
    if (showOtherExams && activeFilters.size > 0) {
        otherExams = exams.filter(e => !activeFilters.has(e.subject));
        allExamsForCalendar = [...allExamsForCalendar, ...otherExams];
    }

        const monthsToShow = hideApril ? [5, 6] : [4, 5, 6];
    const sortedMonths = monthsToShow.map(m => new Date(2026, m - 1, 1));

        function dayCol(date) {
        let d = date.getDay();
        return d === 0 ? 6 : d - 1;
    }

    const today = new Date();

                const table = document.createElement('table');
    table.className = 'multi-calendar continuous-calendar' + (weekends ? ' hide-weekends' : '');

        const thead = table.createTHead();
    const headerRow = thead.insertRow();
    const labelTh = document.createElement('th');
    labelTh.className = 'cal-month-col';
    headerRow.appendChild(labelTh);
    ['MON','TUE','WED','THU','FRI','SAT','SUN'].forEach(name => {
        const th = document.createElement('th');
        th.textContent = name;
        headerRow.appendChild(th);
    });

    const tbody = table.createTBody();

        const cellMap = {};

    sortedMonths.forEach((monthStart, mIdx) => {
        const month = monthStart.getMonth();
        const year = monthStart.getFullYear();

        let cursor = new Date(year, month, 1);
        let firstWeekOfMonth = true;
                let deferredLabel = null;

        while (cursor.getMonth() === month) {
            const col = dayCol(cursor);

            const needNewRow = col === 0 || tbody.rows.length === 0;

            if (needNewRow) {
                const tr = tbody.insertRow();

                                const labelTd = document.createElement('td');
                labelTd.className = 'cal-month-col';

                                if (deferredLabel) {
                    labelTd.textContent = deferredLabel;
                    deferredLabel = null;
                } else if (firstWeekOfMonth && mIdx > 0 && col === 0) {
                                        labelTd.textContent = monthStart.toLocaleString('default', { month: 'short' }).toUpperCase();
                } else if (firstWeekOfMonth && mIdx === 0) {
                                        labelTd.textContent = monthStart.toLocaleString('default', { month: 'short' }).toUpperCase();
                }

                if (firstWeekOfMonth) firstWeekOfMonth = false;
                tr.appendChild(labelTd);

                                if (tbody.rows.length === 1 && col > 0) {
                    for (let i = 0; i < col; i++) {
                        const td = document.createElement('td');
                        td.className = 'empty';
                        tr.appendChild(td);
                    }
                }
            } else if (firstWeekOfMonth) {
                                                firstWeekOfMonth = false;
                deferredLabel = monthStart.toLocaleString('default', { month: 'short' }).toUpperCase();
                            }

                        const currentRow = tbody.rows[tbody.rows.length - 1];
            const td = document.createElement('td');
            const isToday = cursor.getFullYear() === today.getFullYear() &&
                            cursor.getMonth() === today.getMonth() &&
                            cursor.getDate() === today.getDate();
            td.className = isToday ? 'curMonth today' : 'curMonth';
            if (cursor.getDate() === 1 && mIdx > 0) {
                td.classList.add('month-start');
                td.dataset.monthStartCol = col;
            }
            td.dataset.day = cursor.getDate();
            td.dataset.month = cursor.getMonth() + 1;
            td.textContent = cursor.getDate();
            currentRow.appendChild(td);

            cellMap[`${cursor.getDate()}/${cursor.getMonth() + 1}`] = td;

            cursor.setDate(cursor.getDate() + 1);
        }
    });

                                
    const allRows = Array.from(tbody.rows);
    allRows.forEach((row, rowIdx) => {
        const startCell = Array.from(row.cells).find(c => c.classList.contains('month-start'));
        if (!startCell) return;

        const startCol = parseInt(startCell.dataset.monthStartCol);         const startCellIdx = startCol + 1; 
        if (startCol === 0) {
                        for (let i = 0; i < row.cells.length; i++) {
                row.cells[i].classList.add('month-border-top');
            }
        } else {
                                    startCell.classList.add('month-border-left');
                        for (let i = startCellIdx; i < row.cells.length; i++) {
                row.cells[i].classList.add('month-border-top');
            }
                        if (rowIdx + 1 < allRows.length) {
                const nextRow = allRows[rowIdx + 1];
                nextRow.cells[0].classList.add('month-border-top');
                for (let i = 1; i <= startCol; i++) {
                    if (nextRow.cells[i]) nextRow.cells[i].classList.add('month-border-top');
                }
            }
                    }
    });

    wrapper.appendChild(table);
    list.appendChild(wrapper);

        allExamsForCalendar.forEach(ex => {
        const [eDay, eMonth] = ex.date.split('/').map(Number);
        const td = cellMap[`${eDay}/${eMonth}`];
        if (!td) return;

        const examDiv = document.createElement('div');
        examDiv.className = 'cal-exam';
        
                const isOtherExam = activeFilters.size > 0 && !activeFilters.has(ex.subject);
        if (isOtherExam) {
            examDiv.classList.add('other-exam');
        }
        
        examDiv.dataset.code = ex.code;
        const now = Date.now();
        const state = getState(ex.start, ex.end, now);
        const statusBadge = state === 'inprogress'
            ? `<span class="status-badge inprogress">● IN PROGRESS</span>`
            : state === 'over' ? `<span class="status-badge over">EXAM OVER</span>` : '';
        const msLeft = ex.start - now;
        const color = state === 'upcoming' ? fracToColor(getFrac(msLeft)) : state === 'inprogress' ? '#a855f7' : '#3b82f6';
        
                if (!isOtherExam) {
            examDiv.style.borderLeftColor = color;
        }
        
        examDiv.innerHTML = `<span class="cal-exam-subject">${ex.subject}</span><span class="cal-exam-component">${ex.component}</span>`;
        examDiv.innerHTML += `<div class="cal-exam-tooltip" style="border-left-color: ${color}">
            <div class="cal-tooltip-top">
                <div class="cal-tooltip-title-block">
                    <span class="exam-subject">${ex.subject}</span>
                    <span class="exam-component">${ex.component}</span>
                </div>
                ${statusBadge}
            </div>
            <div class="exam-meta">
                <span class="badge"><i class="fas fa-calendar"></i> ${ex.date}/26</span>
                <span class="badge"><i class="fas fa-scroll"></i> ${ex.board} ${ex.level}</span>
                <span class="badge"><i class="fas fa-code"></i> ${ex.code}</span>
                <span class="badge"><i class="fas fa-clock"></i> ${fmtTime(ex.start)} – ${fmtTime(ex.end)}</span>
                <span class="badge"><i class="fas fa-hourglass"></i> ${fmtDuration(ex.durationMin)}</span>
            </div>
            ${makeCountdownBlock(ex, state, now, color, ex.code)}
        </div>`;
        td.appendChild(examDiv);
    });
}

function renderExams(){
    const list=document.getElementById('examList'),
        emptyEl=document.getElementById('emptyState'),
        countInfo=document.getElementById('countInfo');
    list.innerHTML='';
    const now=Date.now();
    const filtered=activeFilters.size===0?exams:exams.filter(e=>activeFilters.has(e.subject));
    currentFiltered = filtered;
    
    const upcoming = filtered.filter(e => getState(e.start,e.end,now) === 'upcoming');
    const inprogress = filtered.filter(e => getState(e.start,e.end,now) === 'inprogress');
    const over = filtered.filter(e => getState(e.start,e.end,now) === 'over');
    const allInprogress = exams.filter(e => getState(e.start,e.end,now) === 'inprogress');
    const otherInprogress = allInprogress.filter(e => !filtered.includes(e));
    const otherCalendarExams = (displayMode === DISPLAY_MODE_CALENDAR && showOtherExams && activeFilters.size > 0)
        ? exams.filter(e => !activeFilters.has(e.subject))
        : [];

    const extraTotal = displayMode === DISPLAY_MODE_CALENDAR
        ? otherCalendarExams.length
        : (showOngoingExams ? otherInprogress.length : 0);
    const extraOver = displayMode === DISPLAY_MODE_CALENDAR
        ? otherCalendarExams.filter(e => getState(e.start,e.end,now) === 'over').length
        : 0;
    const extraInprogress = displayMode === DISPLAY_MODE_CALENDAR
        ? otherCalendarExams.filter(e => getState(e.start,e.end,now) === 'inprogress').length
        : (showOngoingExams ? otherInprogress.length : 0);
    const extraUpcoming = displayMode === DISPLAY_MODE_CALENDAR
        ? otherCalendarExams.filter(e => getState(e.start,e.end,now) === 'upcoming').length
        : 0;

    const displayCount = filtered.length + extraTotal;

    const formatCount = (base, extra) =>
        extra ? `<strong>${base}</strong><span class="count-info-extra">+${extra}</span>` : `<strong>${base}</strong>`;

    countInfo.innerHTML =
    `Showing ${formatCount(filtered.length, extraTotal)} exam${displayCount!==1?'s':''} &nbsp;·&nbsp; `+
    `${formatCount(over.length, extraOver)} over &nbsp;·&nbsp; `+
    `${formatCount(inprogress.length, extraInprogress)} in progress &nbsp;·&nbsp; `+
    `${formatCount(upcoming.length, extraUpcoming)} upcoming`;

    if (!displayCount) {
        emptyEl.style.display='block';
    } else {
        emptyEl.style.display='none';
        
        const halfTermStartMs = HALF_TERM_START.getTime();
        let active = [...(showOngoingExams && displayMode !== DISPLAY_MODE_CALENDAR ? allInprogress : inprogress), ...upcoming];
        let halfTermInserted = false;

            if (displayMode === DISPLAY_MODE_CALENDAR) {
            active = filtered.slice();
            
                    if (showOtherExams && activeFilters.size > 0) {
                const otherExams = exams.filter(e => !activeFilters.has(e.subject));
                active = [...active, ...otherExams];
            }
        }

        if (displayMode !== DISPLAY_MODE_CALENDAR) {
            active.forEach((e,i)=>{
                if(!halfTermInserted && e.start.getTime() >= halfTermStartMs){
                    const div=document.createElement('div');
                    div.className='section-divider half-term-divider';
                    div.innerHTML='<i class="fas fa-leaf"></i> Half Term';
                    list.appendChild(div);
                    halfTermInserted=true;
                }
                list.appendChild(makeCard(e,i));
            });
            if(over.length){
                const div=document.createElement('div');div.className='section-divider';div.textContent='Exam Over';
                list.appendChild(div);
                over.slice().reverse().forEach((e,i)=>list.appendChild(makeCard(e,active.length+i)));
            }
        } else {
            if (!legacyCalMode) {
            renderMultiMonthCalendar(list, active, filtered);
            } else {
            const div = document.createElement('div');
            const buttonsDiv = document.createElement('div');
            buttonsDiv.className="buttonsDiv";
            const monthBackBtn = document.createElement('button');
            monthBackBtn.id='monthBackBtn';
            monthBackBtn.textContent='← Prev';

            const monthText = document.createElement('p');
            monthText.textContent="Loading..."
            const monthFwdBtn = document.createElement('button');
            monthFwdBtn.id='monthFwdBtn';
            monthFwdBtn.textContent='Next →';
            buttonsDiv.appendChild(monthBackBtn);
            buttonsDiv.appendChild(monthText);
            buttonsDiv.appendChild(monthFwdBtn);
            list.appendChild(buttonsDiv)

            div.className='calendar';
            function getDay(date) {let day = date.getDay(); if (day == 0) day = 7; return day - 1;}
            currentDate = new Date(Date.now());
            offsetDate = new Date(currentDate.getFullYear(), currentDate.getMonth()+monthOffset, 1)
            monthText.textContent = offsetDate.toLocaleString('default', { month: 'long', year: 'numeric' });
            monthBackBtn.addEventListener('click' ,() => {
                monthOffset -= 1;
                offsetDate = new Date(currentDate.getFullYear(), currentDate.getMonth()+monthOffset, 1);
                monthText.textContent = offsetDate.toLocaleString('default', { month: 'long', year: 'numeric' });
                createCalendar(offsetDate.valueOf());
                addExams();
            })
            monthFwdBtn.addEventListener('click' ,() => {
                monthOffset += 1;
                offsetDate = new Date(currentDate.getFullYear(), currentDate.getMonth()+monthOffset, 1);
                monthText.textContent = offsetDate.toLocaleString('default', { month: 'long', year: 'numeric' });
                createCalendar(offsetDate.valueOf());
                addExams();
            })
            function createCalendar(dateMS) {
                const today = new Date(Date.now());
                let date = new Date(dateMS);
                const curMonth = date.getMonth();
                let table = '<table id="calendar"' + (weekends ? ' class="hide-weekends"' : '') + '><tr><th>MONDAY</th><th>TUESDAY</th><th>WEDNESDAY</th><th>THURSDAY</th><th>FRIDAY</th><th>SATURDAY</th><th>SUNDAY</th></tr><tr>';
                for (let i = 0; i < getDay(date); i++) {table += '<td id="0 0">'+'</td>';}
                while (date.getMonth() == curMonth) {
                    if (date.getFullYear() == today.getFullYear() && date.getMonth() == today.getMonth() && date.getDate() == today.getDate()) {
                        table += '<td class="curMonth today" id="' + date.getDate() + " "+ date.getMonth() + '">' + date.getDate() + '</td>';
                    } else {
                        table += '<td class="curMonth" id="' + date.getDate() + " "+ date.getMonth() + '">' + date.getDate() + '</td>';
                    }
                    if (getDay(date) % 7 == 6) {table += '</tr><tr>';}
                    date.setDate(date.getDate() + 1);
                }
                if (getDay(date) != 0) {
                    for (let i = getDay(date); i < 7; i++) {
                        table += '<td class="nextMonth" id="' + date.getDate() + " " + date.getMonth() + '">' + Number(date.getDate()) + '</td>';
                        date.setDate(date.getDate() + 1);
                    }
                }
                table += '</tr></table>';
                div.innerHTML = table;
                list.appendChild(div);
                            const calTable = document.getElementById("calendar");
                if (calTable && calTable.rows) {
                    for (let i = 0; i < calTable.rows.length; i++) {
                        calTable.rows[i].style.animationDelay = `${Math.min(i * 20, 300)}ms`;
                    }
                }
            }
            
            function addExams() {
                let table = document.getElementById("calendar");
                for (let i=1, row; row=table.rows[i]; i++) {
                    for (let j=0, col; col=row.cells[j]; j++) {
                        let nday = Number(col.id.split(" ")[0])
                        let nmonth = Number(col.id.split(" ")[1]) + 1
                        let examsOnDay = active.filter(e => [...e.date.split("/")][0] == nday && [...e.date.split("/")][1] == nmonth);
                        if (examsOnDay.length > 0) {
                            for (let i=0; i<examsOnDay.length; i++) {
                                const ex = examsOnDay[i];
                                const examDiv = document.createElement('div');
                                examDiv.className = 'cal-exam';
                                
                                                            const isOtherExam = activeFilters.size > 0 && !activeFilters.has(ex.subject);
                                if (isOtherExam) {
                                    examDiv.classList.add('other-exam');
                                }
                                
                                examDiv.dataset.code = ex.code;
                                const now = Date.now();
                                const state = getState(ex.start, ex.end, now);
                                const statusBadge = state === 'inprogress'
                                ? `<span class="status-badge inprogress">● IN PROGRESS</span>`
                                : state === 'over' ? `<span class="status-badge over">EXAM OVER</span>` : '';
                                const msLeft = ex.start - now;
                                const color = state === 'upcoming' ? fracToColor(getFrac(msLeft)) : state === 'inprogress' ? '#a855f7' : '#3b82f6';
                                
                                                            if (!isOtherExam) {
                                    examDiv.style.borderLeftColor = color;
                                }
                                
                                examDiv.innerHTML = `<span class="cal-exam-subject">${ex.subject}</span><span class="cal-exam-component">${ex.component}</span>`;
                                examDiv.innerHTML += `<div class="cal-exam-tooltip" style="border-left-color: ${color}">
                                    <div class="cal-tooltip-top">
                                        <div class="cal-tooltip-title-block">
                                            <span class="exam-subject">${ex.subject}</span>
                                            <span class="exam-component">${ex.component}</span>
                                        </div>
                                        ${statusBadge}
                                    </div>
                                    <div class="exam-meta">
                                        <span class="badge"><i class="fas fa-calendar"></i> ${ex.date}/26</span>
                                        <span class="badge"><i class="fas fa-scroll"></i> ${ex.board} ${ex.level}</span>
                                        <span class="badge"><i class="fas fa-code"></i> ${ex.code}</span>
                                        <span class="badge"><i class="fas fa-clock"></i> ${fmtTime(ex.start)} – ${fmtTime(ex.end)}</span>
                                        <span class="badge"><i class="fas fa-hourglass"></i> ${fmtDuration(ex.durationMin)}</span>
                                    </div>
                                    ${makeCountdownBlock(ex, state, now, color, ex.code)}
                                </div>`;
                                col.appendChild(examDiv);
                            }
                        }
                    }
                }
            }
            createCalendar(offsetDate.valueOf());
            addExams();
        }
        }
    }

    if (seaEffectEnabled) {
        updateSeaHeight(getSeaTargetPercent());
    }
    updateSidebarTimers();
    if (displayMode === DISPLAY_MODE_PROGRESS) renderProgressTracker();
}

function makeCard(ex,idx){
    const now=Date.now(),state=getState(ex.start,ex.end,now),msLeft=ex.start-now;
    const color=state==='upcoming'?fracToColor(getFrac(msLeft)):state==='inprogress'?'#a855f7':'#3b82f6';
    const card=document.createElement('div');
    card.className=`exam-card state-${state}${ex.isSpeaking?' speaking-card':''}`;
    card.style.borderLeftColor=color;
    card.style.animationDelay=`${Math.min(idx*20,300)}ms`;
    card.dataset.code=ex.code;
    const statusBadge=state==='inprogress'
        ?`<span class="status-badge inprogress">● IN PROGRESS</span>`
        :state==='over'?`<span class="status-badge over">EXAM OVER</span>`:'';
    card.innerHTML=`
        <div class="exam-top">
            <div class="exam-title-block">
                <span class="exam-subject">${ex.subject}</span>
                <span class="exam-component">${ex.component}</span>
            </div>
            ${statusBadge}
        </div>
        <div class="exam-meta">
            <span class="badge"><i class="fas fa-calendar"></i> ${ex.date}/26</span>
            <span class="badge"><i class="fas fa-scroll"></i> ${ex.board} ${ex.level}</span>
            <span class="badge"><i class="fas fa-code"></i> ${ex.code}</span>
            <span class="badge"><i class="fas fa-clock"></i> ${fmtTime(ex.start)} – ${fmtTime(ex.end)}</span>
            <span class="badge"><i class="fas fa-hourglass"></i> ${fmtDuration(ex.durationMin)}</span>
        </div>
        ${makeCountdownBlock(ex, state, now, color, ex.code)}
        <div class="card-hover-tooltip">
            <div class="cal-tooltip-top">
                <div class="cal-tooltip-title-block">
                    <span class="exam-subject">${ex.subject}${ex.isSpeaking?' <i class="fas fa-microphone"></i>':''}</span>
                    <span class="exam-component">${ex.component}</span>
                </div>
                ${statusBadge}
            </div>
            <div class="exam-meta">
                <span class="badge"><i class="fas fa-calendar"></i> ${ex.date}/26</span>
                <span class="badge"><i class="fas fa-scroll"></i> ${ex.board} ${ex.level}</span>
                <span class="badge"><i class="fas fa-code"></i> ${ex.code}</span>
                <span class="badge"><i class="fas fa-clock"></i> ${fmtTime(ex.start)} – ${fmtTime(ex.end)}</span>
                <span class="badge"><i class="fas fa-hourglass"></i> ${fmtDuration(ex.durationMin)}</span>
            </div>
            ${makeCountdownBlock(ex, state, now, color, `${ex.code}-hover`)}
        </div>`;
    return card;
}

function renderProgressTracker() {
    const now = Date.now();
    const allExams = activeFilters.size === 0 ? exams : currentFiltered;

    let totalCompleted = 0;

    const subjectStats = {};
    allExams.forEach(e => {
        const w = Number(e.weight) || 1;
        if (!subjectStats[e.subject]) {
            subjectStats[e.subject] = { totalWeight: 0, completedWeight: 0 };
        }
        subjectStats[e.subject].totalWeight += w;
        if (getState(e.start, e.end, now) === 'over') {
            subjectStats[e.subject].completedWeight += w;
            totalCompleted += 1;
        }
    });

    // Ensure coursework-only subjects show up in progress output only when they are in the active filters
    Object.keys(COURSEWORK).forEach(subject => {
        if ((activeFilters.size === 0 || activeFilters.has(subject)) && !subjectStats[subject]) {
            subjectStats[subject] = { totalWeight: 0, completedWeight: 0 };
        }
    });

    // Always include MFL subjects in progress mode and treat the speaking exam as completed when it exists.
    MFL_SUBJECTS.forEach(subject => {
        if (activeFilters.size === 0 || activeFilters.has(subject)) {
            if (!subjectStats[subject]) {
                subjectStats[subject] = { totalWeight: 0, completedWeight: 0 };
            }

            const hasSpeakingExam = allExams.some(e => e.subject === subject && e.isSpeaking);
            if (!hasSpeakingExam) {
                subjectStats[subject].completedWeight = Math.min(subjectStats[subject].completedWeight + 1, 4);                
            }
            subjectStats[subject].totalWeight = 4;
        }
    });

    const subjects = Object.keys(subjectStats);
    const numSubjects = subjects.length;

                let overallFrac = 0;
    subjects.forEach(subject => {
        const stats = subjectStats[subject];
        const cwPct = COURSEWORK[subject] || 0;
        const writtenPct = 100 - cwPct;
        const writtenDoneFrac = stats.totalWeight > 0 ? (stats.completedWeight / stats.totalWeight) : 0;
        // subject's contribution = (cw always done + written proportion done) / 100, weighted 1/N
        const subjectFrac = (cwPct + writtenDoneFrac * writtenPct) / 100;
        overallFrac += subjectFrac / numSubjects;
    });
    const percent = numSubjects > 0 ? Number((overallFrac * 100).toFixed(1)) : 0;

        const completedPapers = allExams.filter(e => getState(e.start, e.end, now) === 'over').length;
    const totalPapers = allExams.length;

        const lastExam = allExams[allExams.length - 1];
    const daysRemaining = lastExam ? Math.max(0, Math.ceil((lastExam.end - now) / (1000 * 60 * 60 * 24))) : 0;

    document.getElementById('progressCircleLabel').textContent = `of ${numSubjects} GCSEs`;
    document.getElementById('progressCirclePercent').textContent = percent + '%';

    const circle = document.querySelector('.progress-fill');
    if (circle) {
        const circumference = 595.9;
        circle.style.strokeDashoffset = circumference * (1 - percent / 100);
    }

    // ── Hours circle ──
    const totalMin = allExams.reduce((sum, e) => sum + (Number(e.durationMin) || 0), 0);
    const doneMin  = allExams.filter(e => getState(e.start, e.end, now) === 'over')
                            .reduce((sum, e) => sum + (Number(e.durationMin) || 0), 0);
    const remainMin = totalMin - doneMin;

    function fmtHoursMin(min) {
        const h = Math.floor(min / 60), m = min % 60;
        if (!h) return `${m}m`;
        if (!m) return `${h}h`;
        return `${h}h ${m}m`;
    }

    const hoursDoneEl      = document.getElementById('hoursCircleDone');
    const hoursLabelEl     = document.getElementById('hoursCircleLabel');
    const hoursCircle      = document.querySelector('.hours-fill');

    if (hoursDoneEl)   hoursDoneEl.textContent   = fmtHoursMin(doneMin);
    if (hoursLabelEl)  hoursLabelEl.textContent  = `of ${fmtHoursMin(totalMin)}`;
    if (hoursCircle) {
        const circumference = 595.9;
        const hoursFrac = totalMin > 0 ? doneMin / totalMin : 0;
        hoursCircle.style.strokeDashoffset = circumference * (1 - hoursFrac);
    }

    const examsDoneEl      = document.getElementById('examsCircleDone');
    const examsLabelEl     = document.getElementById('examsCircleLabel');
    const examsCircle      = document.querySelector('.exams-fill');

    if (examsDoneEl)   examsDoneEl.textContent   = totalCompleted;
    if (examsLabelEl)  examsLabelEl.textContent  = `of ${allExams.length} exams`;
    if (examsCircle) {
        const circumference = 595.9;
        const examsFrac = allExams.length > 0 ? totalCompleted / allExams.length : 0;
        examsCircle.style.strokeDashoffset = circumference * (1 - examsFrac);
    }

    const subjectsList = document.getElementById('progressSubjectsList');
    if (!subjectsList) return;

    // ── Circle selection: click handlers + selected ring ──
    const circleWrapEls = {
        progress: document.querySelector('.progress-circle-wrap[data-circle="progress"]'),
        hours:    document.querySelector('.progress-circle-wrap[data-circle="hours"]'),
        exams:    document.querySelector('.progress-circle-wrap[data-circle="exams"]'),
    };
    // Fallback: if data-circle attrs not yet set, find them by content
    if (!circleWrapEls.progress || !circleWrapEls.hours || !circleWrapEls.exams) {
        const allWraps = document.querySelectorAll('.progress-circle-wrap');
        if (allWraps.length >= 3) {
            allWraps[0].dataset.circle = 'hours';
            allWraps[1].dataset.circle = 'progress';
            allWraps[2].dataset.circle = 'exams';
            circleWrapEls.hours    = allWraps[0];
            circleWrapEls.progress = allWraps[1];
            circleWrapEls.exams    = allWraps[2];
        }
    }

    function applyCircleSelection() {
        Object.entries(circleWrapEls).forEach(([key, el]) => {
            if (!el) return;
            el.classList.toggle('circle-selected', key === selectedProgressCircle);
        });
    }

    Object.entries(circleWrapEls).forEach(([key, el]) => {
        if (!el || el._circleClickBound) return;
        el._circleClickBound = true;
        el.style.cursor = 'pointer';
        el.addEventListener('click', () => {
            selectedProgressCircle = key;
            save(SELECTED_CIRCLE_KEY, key);
            applyCircleSelection();
            refreshSeaFromSelectedCircle();
        });
    });

    applyCircleSelection();

    subjectsList.innerHTML = '';
    Object.entries(subjectStats).sort((a, b) => a[0].localeCompare(b[0])).forEach(([subject, stats]) => {
        const cwPct = COURSEWORK[subject] || 0;
        const writtenPct = 100 - cwPct;
        const writtenFillPct = stats.totalWeight > 0 ? (stats.completedWeight / stats.totalWeight) * writtenPct : 0;
        const countText = Number((writtenFillPct + cwPct).toFixed(1)) + '%';

        let html = '<div class="subject-progress-item">' +
            '<div class="subject-progress-label">' + subject + '</div>' +
            '<div class="subject-progress-bar-track">';

        if (cwPct > 0) {
            html += '<div class="subject-progress-fill cw-fill" style="width:' + cwPct.toFixed(1) + '%"></div>';
        }
        html += '<div class="subject-progress-fill exam-fill" style="width:' + writtenFillPct.toFixed(1) + '%"></div>';

        html += '</div>' +
            '<div class="subject-progress-count">' + countText + '</div>' +
            '</div>';

        subjectsList.innerHTML += html;
    });

    if (calModeOnly) {
        calModeOnly.forEach((el) => {el.style.display = (displayMode == DISPLAY_MODE_CALENDAR && advancedToggle) ? 'flex' : 'none'});
    }
}

function updateSidebarTimers() {
        const sidebarQuickContent = document.getElementById('sidebarQuickLinksContent');
    const sidebarCountdownsContent = document.getElementById('sidebarCountdownsContent');
    if (sidebarQuickContent) {
        sidebarQuickContent.innerHTML = document.querySelector('.quick-links-menu')?.innerHTML || '';
    }
    if (sidebarCountdownsContent) {
                const rem = document.getElementById('remtime');
        const half = document.getElementById('halfTermTime');
        const end = document.getElementById('endremtime');
        sidebarCountdownsContent.innerHTML = `
            <div class="sidebar-quick-count"><strong>Next:</strong> <span>${rem?.textContent || '–'}</span><div class="sidebar-sublabel">${document.getElementById('remtimeLabel')?.textContent || ''}</div></div>
            <div class="sidebar-quick-count"><strong>Half term:</strong> <span>${half?.textContent || '–'}</span><div class="sidebar-sublabel">${document.getElementById('halfTermLabel')?.textContent || ''}</div></div>
            <div class="sidebar-quick-count"><strong>End of exams:</strong> <span>${end?.textContent || '–'}</span><div class="sidebar-sublabel">${document.getElementById('endremtimeLabel')?.textContent || ''}</div></div>
        `;
    }

    const now = Date.now();

        const nextUpcoming = currentFiltered.find(e => getState(e.start, e.end, now) === 'upcoming');
    const remtimeEl = document.getElementById('remtime');
    const sidebarRemtimeEl = document.getElementById('sidebar-remtime');
    const remtimeLabelEl = document.getElementById('remtimeLabel');
    const sidebarRemtimeLabelEl = document.getElementById('sidebar-remtimeLabel');
    if (nextUpcoming) {
        const countdownText = fmtCountdown(nextUpcoming.start - now);
        const labelText = `${nextUpcoming.subject} · ${nextUpcoming.component}`;
        if (remtimeEl) { remtimeEl.textContent = countdownText; }
        if (sidebarRemtimeEl) { sidebarRemtimeEl.textContent = countdownText; }
        if (remtimeLabelEl) { remtimeLabelEl.textContent = labelText; }
        if (sidebarRemtimeLabelEl) { sidebarRemtimeLabelEl.textContent = labelText; }
        if (remtimeEl) { remtimeEl.dataset.code = nextUpcoming.code; }
        if (sidebarRemtimeEl) { sidebarRemtimeEl.dataset.code = nextUpcoming.code; }
    } else {
        if (remtimeEl) { remtimeEl.textContent = '–'; remtimeEl.dataset.code = ''; }
        if (sidebarRemtimeEl) { sidebarRemtimeEl.textContent = '–'; sidebarRemtimeEl.dataset.code = ''; }
        if (remtimeLabelEl) { remtimeLabelEl.textContent = ''; }
        if (sidebarRemtimeLabelEl) { sidebarRemtimeLabelEl.textContent = ''; }
    }

        const last = currentFiltered.length ? currentFiltered[currentFiltered.length - 1] : null;
    const endremtimeEl = document.getElementById('endremtime');
    const sidebarEndremtimeEl = document.getElementById('sidebar-endremtime');
    if (last) {
        const countdownText = fmtCountdown(last.end - now);
        const labelText = `After: ${last.subject} · ${last.component}`;
        if (endremtimeEl) { endremtimeEl.textContent = countdownText; }
        if (sidebarEndremtimeEl) { sidebarEndremtimeEl.textContent = countdownText; }
        const endremtimeLabelEl = document.getElementById('endremtimeLabel');
        const sidebarEndremtimeLabelEl = document.getElementById('sidebar-endremtimeLabel');
        if (endremtimeLabelEl) { endremtimeLabelEl.textContent = labelText; }
        if (sidebarEndremtimeLabelEl) { sidebarEndremtimeLabelEl.textContent = labelText; }
        if (endremtimeEl) { endremtimeEl.dataset.code = last.code; }
        if (sidebarEndremtimeEl) { sidebarEndremtimeEl.dataset.code = last.code; }
    } else {
        if (endremtimeEl) { endremtimeEl.textContent = '–'; endremtimeEl.dataset.code = ''; }
        if (sidebarEndremtimeEl) { sidebarEndremtimeEl.textContent = '–'; sidebarEndremtimeEl.dataset.code = ''; }
        const endremtimeLabelEl = document.getElementById('endremtimeLabel');
        const sidebarEndremtimeLabelEl = document.getElementById('sidebar-endremtimeLabel');
        if (endremtimeLabelEl) { endremtimeLabelEl.textContent = ''; }
        if (sidebarEndremtimeLabelEl) { sidebarEndremtimeLabelEl.textContent = ''; }
    }

        const halfTermTimeEl = document.getElementById('halfTermTime');
    const sidebarHalfTermTimeEl = document.getElementById('sidebar-halfTermTime');
    const halfTermLabelEl = document.getElementById('halfTermLabel');
    const sidebarHalfTermLabelEl = document.getElementById('sidebar-halfTermLabel');
    const halfTermBoxEl = halfTermTimeEl?.parentElement;
    const halfTermMs = HALF_TERM_START.getTime();
    const examsBeforeHalfTerm = currentFiltered.filter(e => e.start.getTime() < halfTermMs);
    if (examsBeforeHalfTerm.length > 0) {
        const lastBeforeHT = examsBeforeHalfTerm[examsBeforeHalfTerm.length - 1];
        const msLeft = lastBeforeHT.end - now;
        if (msLeft > 0) {
            if (halfTermBoxEl) halfTermBoxEl.style.display = '';
            const countdownText = fmtCountdown(msLeft);
            const labelText = `After: ${lastBeforeHT.subject} · ${lastBeforeHT.component}`;
            if (halfTermTimeEl) { halfTermTimeEl.textContent = countdownText; }
            if (sidebarHalfTermTimeEl) { sidebarHalfTermTimeEl.textContent = countdownText; }
            if (halfTermLabelEl) { halfTermLabelEl.textContent = labelText; }
            if (sidebarHalfTermLabelEl) { sidebarHalfTermLabelEl.textContent = labelText; }
            if (halfTermTimeEl) { halfTermTimeEl.dataset.code = lastBeforeHT.code; }
            if (sidebarHalfTermTimeEl) { sidebarHalfTermTimeEl.dataset.code = lastBeforeHT.code; }
        } else {
            if (halfTermBoxEl) halfTermBoxEl.style.display = 'none';
            if (halfTermTimeEl) { halfTermTimeEl.textContent = '–'; halfTermTimeEl.dataset.code = ''; }
            if (sidebarHalfTermTimeEl) { sidebarHalfTermTimeEl.textContent = '–'; sidebarHalfTermTimeEl.dataset.code = ''; }
            if (halfTermLabelEl) { halfTermLabelEl.textContent = ''; }
            if (sidebarHalfTermLabelEl) { sidebarHalfTermLabelEl.textContent = ''; }
        }
    } else {
        if (halfTermBoxEl) halfTermBoxEl.style.display = 'none';
        if (halfTermTimeEl) { halfTermTimeEl.textContent = '–'; halfTermTimeEl.dataset.code = ''; }
        if (sidebarHalfTermTimeEl) { sidebarHalfTermTimeEl.textContent = '–'; sidebarHalfTermTimeEl.dataset.code = ''; }
        if (halfTermLabelEl) { halfTermLabelEl.textContent = ''; }
        if (sidebarHalfTermLabelEl) { sidebarHalfTermLabelEl.textContent = ''; }
    }
}

function initRevisionPlanner() {
    if (document.getElementById('examList').style.display === 'none') {
        document.getElementById('examList').style.display = 'block';
    } else {
        document.getElementById('examList').style.display = 'none';
    }
}

let dateFormatted;

function updateDay() {
    dateFormatted = new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})
    document.getElementById('date').textContent = dateFormatted;
}

updateDay()

function updateClock(){
    let timeFormatted = new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})
    if (timeFormatted.split(":")[-2] == 0) {
        updateDay();
    }
    document.getElementById('clock').textContent=
        `${dateFormatted} | ${timeFormatted}`;
}

function updateTime(){
    let timeFormatted = new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})
    document.getElementById('time').textContent=timeFormatted;
}

exams.forEach(e=>{prevStates[e.code]=getState(e.start,e.end,Date.now());});

function tick(){
    const now=Date.now();
    let changed=false;
    exams.forEach(e=>{const s=getState(e.start,e.end,now);if(prevStates[e.code]!==s){prevStates[e.code]=s;changed=true;}});
    if(changed){renderExams();return;}

    updateSidebarTimers();
    
    
    document.querySelectorAll('[data-code]').forEach(el=>{
        if(!el.classList.contains('countdown-timer'))return;
        const code = el.dataset.code.replace('-hover','');
        const exam = exams.find(x=>x.code===code);
        if(!exam) return;
        const state = getState(exam.start, exam.end, now);
        if(state !== 'upcoming' && state !== 'inprogress') return;

        const msLeft = exam.start - now;
        const msUntilEnd = exam.end - now;
        const timerText = state === 'upcoming'
            ? fmtCountdown(msLeft)
            : `Ends in ${fmtCountdown(msUntilEnd)}`;
        el.textContent = timerText;

        if (!el.dataset.code.endsWith('-hover')) {
            const bar = document.querySelector(`[data-bar="${exam.code}"]`);
            const barHover = document.querySelector(`[data-bar="${exam.code}-hover"]`);
            if (state === 'upcoming') {
                const frac = getFrac(msLeft);
                const color = fracToColor(frac);
                if(bar){bar.style.width=(frac*100).toFixed(3)+'%'; bar.style.background=color;}
                if(barHover){barHover.style.width=(frac*100).toFixed(3)+'%'; barHover.style.background=color;}
                const card = el.closest('.exam-card');
                if(card) card.style.borderLeftColor = color;
            } else {
                const duration = exam.end - exam.start;
                const frac = Math.max(0, Math.min(1, msUntilEnd / duration));
                const color = '#a855f7';
                if(bar){bar.style.width=(frac*100).toFixed(3)+'%'; bar.style.background=color;}
                if(barHover){barHover.style.width=(frac*100).toFixed(3)+'%'; barHover.style.background=color;}
            }
        }
    });
}

const examList = document.getElementById('examList');

function positionTooltip(pill, tooltip) {
    pill.classList.remove('flip-up', 'flip-left');

    tooltip.style.display = 'block';

    const tr = tooltip.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;

    if (tr.bottom > vh - 10) pill.classList.add('flip-up');
    if (tr.right > vw - 10) pill.classList.add('flip-left');

    tooltip.style.display = '';
}

// Desktop hover
examList.addEventListener('mouseenter', e => {
    const pill = e.target.closest('.cal-exam');
    if (!pill) return;

    const tooltip = pill.querySelector('.cal-exam-tooltip');
    if (!tooltip) return;

    positionTooltip(pill, tooltip);
}, true);

// Mobile tap
document.addEventListener('click', e => {
    const pill = e.target.closest('.cal-exam');

    // Hide all tooltips first
    document.querySelectorAll('.cal-exam.open').forEach(el => {
        if (el !== pill) el.classList.remove('open');
    });

    // Clicked outside any exam
    if (!pill) return;

    const tooltip = pill.querySelector('.cal-exam-tooltip');
    if (!tooltip) return;

    e.stopPropagation();

    const isOpen = pill.classList.contains('open');

    document.querySelectorAll('.cal-exam.open')
        .forEach(el => el.classList.remove('open'));

    if (!isOpen) {
        pill.classList.add('open');
        positionTooltip(pill, tooltip);
    }
});

document.getElementById('examList').addEventListener('mouseenter', e => {
    const card = e.target.closest('.exam-card');
    if (!card) return;
    const tooltip = card.querySelector('.card-hover-tooltip');
    if (!tooltip) return;
    card.classList.remove('tooltip-flip-up', 'tooltip-flip-left');
    tooltip.style.display = 'block';
    const tr = tooltip.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    if (tr.bottom > vh - 10) card.classList.add('tooltip-flip-up');
    if (tr.right > vw - 10) card.classList.add('tooltip-flip-left');
    tooltip.style.display = '';
}, true);

function scrollToExam(examCode) {
    if (!examCode) return;
    
        const examList = document.getElementById('examList');
    if (!examList) return;
    
    let examEl = null;
        examEl = examList.querySelector(`[data-code="${examCode}"]`);
    
    if (examEl) {
                examEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
                const container = examEl.closest('.exam-card') || examEl.closest('.cal-exam') || examEl.closest('.exam-row');
        if (container) {
            container.classList.add('highlight-flash');
            setTimeout(() => container.classList.remove('highlight-flash'), 600);
        }
    }
}

if (countdownsMenu) {
    const countdownBoxes = countdownsMenu.querySelectorAll('.countdown-box');
    countdownBoxes[0]?.addEventListener('click', () => scrollToExam(document.getElementById('remtime')?.dataset.code));
    countdownBoxes[1]?.addEventListener('click', () => scrollToExam(document.getElementById('halfTermTime')?.dataset.code));
    countdownBoxes[2]?.addEventListener('click', () => scrollToExam(document.getElementById('endremtime')?.dataset.code));
    
        countdownBoxes.forEach(box => {
        box.style.cursor = 'pointer';
    });
}

//ASSISTANT MODULE

(function() {

const ASST_KEY = 'asst_data_v1';

function pctToGrade(pct) {
    if (pct >= 91) return 9;
    if (pct >= 79) return 8;
    if (pct >= 67) return 7;
    if (pct >= 55) return 6;
    if (pct >= 43) return 5;
    if (pct >= 31) return 4;
    if (pct >= 19) return 3;
    if (pct >= 9)  return 2;
    return 1;
}

function loadAsstData() {
    try {
        const raw = localStorage.getItem(ASST_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch(e) { return {}; }
}
function saveAsstData(d) {
    try { localStorage.setItem(ASST_KEY, JSON.stringify(d)); } catch(e) {}
}

let asstData = loadAsstData();

function ensureSubject(name) {
    if (!asstData.subjects) asstData.subjects = {};
    if (!asstData.subjects[name]) asstData.subjects[name] = { priority: 5, difficulty: {}, pastPapers: [] };
    return asstData.subjects[name];
}
function ensureCW() {
    if (!asstData.coursework) asstData.coursework = { history: {}, sc: {}, art: {}, electronics: {}, music: {}, drama: {} };
}

function getActiveSubjects() {
    const examSubjects = [...new Set(baseExams.map(e => e.subject))];
    const courseworkSubjects = Object.keys(COURSEWORK).filter(s => !examSubjects.includes(s));
    const all = [...new Set([...examSubjects, ...courseworkSubjects])].sort();
    if (!activeFilters || activeFilters.size === 0) return all;
    return all.filter(s => activeFilters.has(s));
}

function getPapersForSubject(subj) {
    return baseExams.filter(e => e.subject === subj);
}

function linearPredict(points, targetX) {
        if (points.length === 0) return null;
    if (points.length === 1) return points[0].y;
    const n = points.length;
    const sumX = points.reduce((a,p) => a + p.x, 0);
    const sumY = points.reduce((a,p) => a + p.y, 0);
    const sumXY = points.reduce((a,p) => a + p.x * p.y, 0);
    const sumX2 = points.reduce((a,p) => a + p.x * p.x, 0);
    const denom = n * sumX2 - sumX * sumX;
    if (denom === 0) return sumY / n;
    const slope = (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;
    return Math.max(0, Math.min(100, slope * targetX + intercept));
}

function calcPredictions() {
    const results = {};     const subjects = getActiveSubjects();
    ensureCW();

    subjects.forEach(subj => {
        const sd = asstData.subjects?.[subj];
        if (!sd || !sd.pastPapers || sd.pastPapers.length === 0) return;

        const papers = sd.pastPapers.filter(p => p.pct !== '' && p.pct !== null && !isNaN(+p.pct) && p.date);
        if (papers.length === 0) return;

                const examDates = getPapersForSubject(subj).map(e => e.start.getTime()).sort((a,b)=>a-b);
        const targetX = examDates.length > 0 ? examDates[0] : Date.now() + 30*24*3600*1000;

        const points = papers.map(p => ({
            x: new Date(p.date).getTime(),
            y: +p.pct
        })).filter(p => !isNaN(p.x));

        if (points.length === 0) return;

        let predicted = linearPredict(points, targetX);

                const priority = +(sd.priority || 5);
        const priorityAdj = (priority - 5) * 1.0;         predicted = Math.max(0, Math.min(100, predicted + priorityAdj));

        results[subj] = { pct: predicted, grade: pctToGrade(predicted), priority };
    });

    // Incorporate coursework into subject predictions
    const cw = asstData.coursework || {};
    const courseworkSubjects = Object.keys(COURSEWORK).reduce((acc, subject) => {
        const ids = getCWFieldIds(subject);
        acc[subject] = cw[ids.key];
        return acc;
    }, {});
    Object.entries(courseworkSubjects).forEach(([subject, data]) => {
        if (!data?.pct && data?.pct !== 0 && data?.pct !== '0') return;
        const pct = +data.pct;
        if (isNaN(pct)) return;

        if (!results[subject]) {
            results[subject] = { pct, grade: pctToGrade(pct), priority: 5 };
        } else {
            const examPct = results[subject].pct;
            const cwWeight = COURSEWORK[subject] || 0;
            const examWeight = 100 - cwWeight;
            if (examWeight <= 0) {
                results[subject].pct = pct;
            } else {
                results[subject].pct = (cwWeight * pct + examWeight * examPct) / 100;
            }
            results[subject].grade = pctToGrade(results[subject].pct);
        }
    });

    return results;
}

function calcTotal(predictions) {
    const vals = Object.values(predictions).map(v => v.pct);
    if (vals.length === 0) return null;
    return vals.reduce((a,b) => a+b, 0) / vals.length;
}

function calcRevisionPriority(predictions) {
            const subjects = getActiveSubjects();
    const ranked = [];

    subjects.forEach(subj => {
        const sd = asstData.subjects?.[subj];
        const pred = predictions[subj];
        let basePct;

        if (sd && sd.pastPapers && sd.pastPapers.length > 0) {
            const valid = sd.pastPapers.filter(p => p.pct !== '' && !isNaN(+p.pct)).map(p => +p.pct);
            if (valid.length >= 2) basePct = (valid[valid.length-1] + valid[valid.length-2]) / 2;
            else if (valid.length === 1) basePct = valid[0];
        }
        if (basePct === undefined && pred) basePct = pred.pct;
        if (basePct === undefined) return;

                const userPri = +(sd?.priority || 5);
        const score = (100 - basePct) * (userPri / 5);
        ranked.push({ subj, score, basePct, userPri });
    });

    // Incorporate coursework subjects that have no exam papers
    const cw = asstData.coursework || {};
    const courseworkSubjects = Object.keys(COURSEWORK).reduce((acc, subject) => {
        const ids = getCWFieldIds(subject);
        acc[subject] = cw[ids.key];
        return acc;
    }, {});
    Object.entries(courseworkSubjects).forEach(([subj, pctValue]) => {
        if (ranked.find(r => r.subj === subj)) return;
        const cwPct = pctValue === undefined || pctValue === '' ? NaN : +pctValue;
        if (!isNaN(cwPct)) {
            const sd = asstData.subjects?.[subj];
            const userPri = +(sd?.priority || 5);
            const score = (100 - cwPct) * (userPri / 5);
            ranked.push({ subj, score, basePct: cwPct, userPri });
        }
    });

    return ranked.sort((a,b) => b.score - a.score);
}

const GRADE_BANDS = [
    { label: '90–100%', min: 90, max: 100, color: '#22c55e' },
    { label: '80–90%',  min: 80, max: 90,  color: '#86efac' },
    { label: '70–80%',  min: 70, max: 80,  color: '#fbbf24' },
    { label: '60–70%',  min: 60, max: 70,  color: '#fb923c' },
    { label: '50–60%',  min: 50, max: 60,  color: '#f87171' },
    { label: 'Below 50%', min: 0, max: 50, color: '#ef4444' },
];

function bucketPcts(pcts) {
            const counts = GRADE_BANDS.map(b => ({ ...b, count: 0 }));
    pcts.forEach(p => {
        for (let i = 0; i < counts.length; i++) {
            if (p >= counts[i].min && (p < counts[i].max || (counts[i].max === 100 && p <= 100))) {
                counts[i].count++;
                break;
            }
        }
    });
    return counts.filter(c => c.count > 0);
}

function drawPie(canvasId, bands) {
        const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const total = bands.reduce((a,d) => a + d.count, 0);
    if (total === 0) return;

    const cx = W/2, cy = H/2, r = Math.min(W,H)/2 - 4;
    let startAngle = -Math.PI/2;

    bands.forEach(d => {
        const slice = (d.count / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, startAngle + slice);
        ctx.closePath();
        ctx.fillStyle = d.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        startAngle += slice;
    });
}

function drawLegend(legendId, bands, total) {
    const el = document.getElementById(legendId);
    if (!el) return;
    el.innerHTML = bands.map(d => `
        <div class="asst-legend-item">
            <div class="asst-legend-dot" style="background:${d.color}"></div>
            <span>${d.label} — ${d.count} exam${d.count !== 1 ? 's' : ''} (${Math.round(d.count/total*100)}%)</span>
        </div>
    `).join('');
}

function renderPredictions() {
    const predictions = calcPredictions();
    const predContent = document.getElementById('asstPredictionsContent');
    const totalBox = document.getElementById('asstTotalBox');
    const totalVal = document.getElementById('asstTotalVal');
    const totalPct = document.getElementById('asstTotalPct');
    const priorityBox = document.getElementById('asstPriorityBox');
    const priorityList = document.getElementById('asstPriorityList');

    if (!predContent) return;

    const subjects = Object.keys(predictions);
    if (subjects.length === 0) {
        predContent.innerHTML = '<div class="asst-empty">Add past paper marks in the Input tab to generate predictions.</div>';
        totalBox.style.display = 'none';
        priorityBox.style.display = 'none';
        return;
    }

    predContent.innerHTML = '<div class="asst-pred-grid">' + subjects.map(subj => {
        const p = predictions[subj];
        const barW = p.pct.toFixed(1);
        return `<div class="asst-pred-row">
            <span class="asst-pred-subject">${subj}</span>
            <div class="asst-pred-bar-wrap" title="${barW}%"><div class="asst-pred-bar" style="width:${barW}%"></div></div>
            <span class="asst-pred-val">${barW}%</span>
            <span class="asst-pred-grade">${p.grade}</span>
        </div>`;
    }).join('') + '</div>';

    const total = calcTotal(predictions);
    if (total !== null) {
        totalBox.style.display = 'flex';
        totalVal.textContent = pctToGrade(total);
        totalPct.textContent = total.toFixed(1) + '%';
    } else {
        totalBox.style.display = 'none';
    }

    const ranked = calcRevisionPriority(predictions);
    if (ranked.length > 0) {
        priorityBox.style.display = 'block';
        priorityList.innerHTML = ranked.map((r, i) => {
            const badge = i < Math.ceil(ranked.length/3) ? 'high' : i < Math.ceil(2*ranked.length/3) ? 'med' : 'low';
            const badgeText = badge === 'high' ? 'Priority' : badge === 'med' ? 'Moderate' : 'Low';
            return `<div class="asst-priority-list-item">
                <span class="asst-pri-rank">${i+1}.</span>
                <span class="asst-pri-subject">${r.subj}</span>
                <span class="asst-pri-score">${r.basePct.toFixed(1)}%</span>
                <span class="asst-pri-badge ${badge}">${badgeText}</span>
            </div>`;
        }).join('');
    } else {
        priorityBox.style.display = 'none';
    }
}

function renderOverview() {
    const predictions = calcPredictions();
    const subjects = Object.keys(predictions);
    const emptyEl = document.getElementById('asstOverviewEmpty');
    const chartsRow = document.querySelector('.asst-charts-row');

    if (subjects.length === 0) {
        if (emptyEl) emptyEl.style.display = 'block';
        if (chartsRow) chartsRow.style.display = 'none';
        return;
    }
    if (emptyEl) emptyEl.style.display = 'none';
    if (chartsRow) chartsRow.style.display = 'flex';

        const subjectPcts = subjects.map(s => predictions[s].pct);
    const subjectBands = bucketPcts(subjectPcts);
    drawPie('chartBySubject', subjectBands);
    drawLegend('legendBySubject', subjectBands, subjectPcts.length);

        const examPcts = [];
    subjects.forEach(subj => {
        const papers = getPapersForSubject(subj);
        const sd = asstData.subjects?.[subj];
        const valid = sd?.pastPapers?.filter(p => p.pct !== '' && !isNaN(+p.pct)) || [];
        const avgPct = valid.length > 0 ? valid.reduce((a,p) => a + +p.pct, 0) / valid.length : predictions[subj].pct;
        papers.forEach(() => examPcts.push(avgPct));
        if (papers.length === 0) examPcts.push(predictions[subj].pct);
    });
    const examBands = bucketPcts(examPcts);
    drawPie('chartByExam', examBands);
    drawLegend('legendByExam', examBands, examPcts.length);

        const ranked = calcRevisionPriority(predictions);
    const top4El = document.getElementById('asstOverviewTop4');
    if (top4El) {
        const top4 = ranked.slice(0, 4);
        if (top4.length === 0) {
            top4El.style.display = 'none';
        } else {
            top4El.style.display = 'block';
            top4El.innerHTML = `<div class="asst-section-header" style="margin-top:12px">Top Revision Priorities</div>` +
                top4.map((r, i) => {
                    const badge = i === 0 ? 'high' : i < 3 ? 'med' : 'low';
                    return `<div class="asst-priority-list-item">
                        <span class="asst-pri-rank">${i+1}.</span>
                        <span class="asst-pri-subject">${r.subj}</span>
                        <span class="asst-pri-score">${r.basePct.toFixed(1)}%</span>
                        <span class="asst-pri-badge ${badge}">${['Focus', 'High', 'Med', 'Low'][i]}</span>
                    </div>`;
                }).join('');
        }
    }
}

function buildPPRows(subj) {
    const sd = asstData.subjects?.[subj];
    const papers = sd?.pastPapers || [];
    const rows = papers.map((pp, idx) => `
        <div class="asst-pp-row" data-idx="${idx}">
            <span class="asst-pp-row-label">#${idx+1}</span>
            <input class="asst-pp-input asst-pp-pct" type="number" min="0" max="100" placeholder="%" value="${pp.pct ?? ''}" data-field="pct" data-subj="${subj}" data-idx="${idx}" title="Percentage">
            <input class="asst-pp-input asst-pp-grade" type="number" min="1" max="9" placeholder="1-9" value="${pp.grade ?? ''}" data-field="grade" data-subj="${subj}" data-idx="${idx}" title="Grade">
            <input class="asst-pp-input asst-pp-date" type="date" value="${pp.date ?? ''}" data-field="date" data-subj="${subj}" data-idx="${idx}" title="Date completed">
            <button class="asst-pp-del" data-subj="${subj}" data-idx="${idx}" title="Remove"><i class="fas fa-times"></i></button>
        </div>
    `).join('');
    return `<div class="asst-pp-list" id="ppList-${CSS.escape(subj)}">${rows}</div>
    <button class="asst-add-pp" data-subj="${subj}"><i class="fas fa-plus"></i> Add Past Paper</button>`;
}

// ── Render input pane ─────────────────────────────────────────────────────
function normalizeCWKey(subject) {
    return subject.toLowerCase().replace(/[^a-z0-9]+/g, '');
}
function getCWFieldIds(subject) {
    const key = normalizeCWKey(subject);
    return { key, pctId: `cw${key}Pct`, gradeId: `cw${key}Grade` };
}
function courseworkLabel(subject) {
    if (subject === 'S&C / PD') return 'S&C / PD NEA';
    return `${subject} Coursework`;
}
function renderCourseworkHTML() {
    const grid = document.getElementById('asstCourseworkGrid');
    if (!grid) return;
    grid.innerHTML = Object.keys(COURSEWORK).map(subject => {
        const ids = getCWFieldIds(subject);
        return `<div class="asst-coursework-row" data-subject="${subject}">
            <span class="asst-cw-label">${courseworkLabel(subject)}</span>
            <input class="asst-input-sm" type="number" min="0" max="100" placeholder="%" id="${ids.pctId}" title="Mark as %">
            <input class="asst-input-sm asst-grade" type="number" min="1" max="9" placeholder="1-9" id="${ids.gradeId}" title="Grade">
        </div>`;
    }).join('');
}
function renderCourseworkInputs() {
    const selectedCoursework = activeFilters.size === 0
        ? Object.keys(COURSEWORK)
        : Object.keys(COURSEWORK).filter(subject => activeFilters.has(subject));

    Object.keys(COURSEWORK).forEach(subject => {
        const ids = getCWFieldIds(subject);
        const row = document.querySelector(`.asst-coursework-row[data-subject="${subject}"]`);
        if (!row) return;
        row.style.display = selectedCoursework.includes(subject) ? '' : 'none';
    });

    const grid = document.getElementById('asstCourseworkGrid');
    if (grid) {
        grid.style.display = selectedCoursework.length > 0 ? '' : 'none';
    }
}

function renderInputPane() {
    const subjects = getActiveSubjects();
    const container = document.getElementById('asstSubjectInputs');
    if (!container) return;

    container.innerHTML = subjects.map(subj => {
        const sd = ensureSubject(subj);
        const papers = getPapersForSubject(subj);

                const diffRows = papers.map(p => {
            const val = sd.difficulty?.[p.code] ?? 5;
            return `<div class="asst-difficulty-row">
                <span class="asst-diff-label">${p.component}</span>
                <input class="asst-slider" type="range" min="1" max="10" step="1"
                    value="${val}"
                    data-subj="${subj}" data-code="${p.code}"
                    title="Difficulty 1-10">
                <span class="asst-slider-val" id="diffVal-${CSS.escape(p.code)}">${val}</span>
            </div>`;
        }).join('');

        return `<div class="asst-subject-block" id="asstBlock-${CSS.escape(subj)}">
            <div class="asst-subject-header">
                <span class="asst-subject-name">${subj}</span>
                <div class="asst-priority-row">
                    <span class="asst-priority-label">Priority</span>
                    <input class="asst-slider" type="range" min="1" max="10" step="1"
                        value="${sd.priority ?? 5}" data-subj="${subj}" data-field="priority" title="Revision priority 1-10">
                    <span class="asst-slider-val" id="priVal-${CSS.escape(subj)}">${sd.priority ?? 5}</span>
                </div>
                <i class="fas fa-chevron-down asst-subject-chevron"></i>
            </div>
            <div class="asst-subject-body">
                ${papers.length > 0 ? `<div class="asst-section-header" style="margin-bottom:6px">Paper Difficulty</div><div class="asst-difficulty-grid">${diffRows}</div>` : ''}
                <div class="asst-pp-section">
                    <div class="asst-pp-header">Past Papers</div>
                    ${buildPPRows(subj)}
                </div>
            </div>
        </div>`;
    }).join('');

    // Attach events
    attachInputEvents();
    renderCourseworkInputs();
}

function attachInputEvents() {
    const container = document.getElementById('asstSubjectInputs');
    if (!container) return;

        container.querySelectorAll('.asst-subject-header').forEach(h => {
        h.addEventListener('click', function(e) {
                        if (e.target.tagName === 'INPUT') return;
            const block = this.closest('.asst-subject-block');
            block.classList.toggle('open');
        });
    });

        container.querySelectorAll('[data-field="priority"]').forEach(inp => {
        inp.addEventListener('input', function() {
            const subj = this.dataset.subj;
            const valEl = document.getElementById('priVal-' + CSS.escape(subj));
            if (valEl) valEl.textContent = this.value;
            ensureSubject(subj).priority = +this.value;
            saveAsstData(asstData);
        });
    });

        container.querySelectorAll('.asst-slider[data-code]').forEach(inp => {
        inp.addEventListener('input', function() {
            const subj = this.dataset.subj;
            const code = this.dataset.code;
            const valEl = document.getElementById('diffVal-' + CSS.escape(code));
            if (valEl) valEl.textContent = this.value;
            ensureSubject(subj).difficulty[code] = +this.value;
            saveAsstData(asstData);
        });
    });

        container.addEventListener('change', function(e) {
        const inp = e.target;
        if (!inp.dataset.subj || !inp.dataset.field || inp.dataset.idx === undefined) return;
        const subj = inp.dataset.subj;
        const idx = +inp.dataset.idx;
        const field = inp.dataset.field;
        const sd = ensureSubject(subj);
        if (!sd.pastPapers[idx]) sd.pastPapers[idx] = {};
        sd.pastPapers[idx][field] = inp.value;
        saveAsstData(asstData);
    });

        container.querySelectorAll('.asst-add-pp').forEach(btn => {
        btn.addEventListener('click', function() {
            const subj = this.dataset.subj;
            const sd = ensureSubject(subj);
            sd.pastPapers.push({ pct: '', grade: '', date: '' });
            saveAsstData(asstData);
                        const ppSection = this.parentElement;
            ppSection.innerHTML = buildPPRows(subj);
            reAttachPPEvents(subj, ppSection);
        });
    });

        container.querySelectorAll('.asst-pp-del').forEach(btn => {
        btn.addEventListener('click', function() {
            const subj = this.dataset.subj;
            const idx = +this.dataset.idx;
            const sd = ensureSubject(subj);
            sd.pastPapers.splice(idx, 1);
            saveAsstData(asstData);
            const ppSection = this.closest('.asst-pp-section');
            ppSection.innerHTML = '<div class="asst-pp-header">Past Papers</div>' + buildPPRows(subj);
            reAttachPPEvents(subj, ppSection);
        });
    });
}

function reAttachPPEvents(subj, ppSection) {
    ppSection.querySelectorAll('.asst-add-pp').forEach(btn => {
        btn.addEventListener('click', function() {
            const sd = ensureSubject(subj);
            sd.pastPapers.push({ pct: '', grade: '', date: '' });
            saveAsstData(asstData);
            ppSection.innerHTML = '<div class="asst-pp-header">Past Papers</div>' + buildPPRows(subj);
            reAttachPPEvents(subj, ppSection);
        });
    });
    ppSection.querySelectorAll('.asst-pp-del').forEach(btn => {
        btn.addEventListener('click', function() {
            const idx = +this.dataset.idx;
            const sd = ensureSubject(subj);
            sd.pastPapers.splice(idx, 1);
            saveAsstData(asstData);
            ppSection.innerHTML = '<div class="asst-pp-header">Past Papers</div>' + buildPPRows(subj);
            reAttachPPEvents(subj, ppSection);
        });
    });
    ppSection.addEventListener('change', function(e) {
        const inp = e.target;
        if (!inp.dataset.subj || !inp.dataset.field || inp.dataset.idx === undefined) return;
        const idx = +inp.dataset.idx;
        const field = inp.dataset.field;
        const sd = ensureSubject(subj);
        if (!sd.pastPapers[idx]) sd.pastPapers[idx] = {};
        sd.pastPapers[idx][field] = inp.value;
        saveAsstData(asstData);
    });
}

function attachCourseworkEvents() {
    const fields = Object.keys(COURSEWORK).flatMap(subject => {
        const ids = getCWFieldIds(subject);
        return [
            [ids.pctId, ids.key, 'pct'],
            [ids.gradeId, ids.key, 'grade'],
        ];
    });
    fields.forEach(([id, key, field]) => {
        const el = document.getElementById(id);
        if (!el) return;
        ensureCW();
        el.value = asstData.coursework?.[key]?.[field] ?? '';
        el.addEventListener('change', function() {
            ensureCW();
            if (!asstData.coursework[key]) asstData.coursework[key] = {};
            asstData.coursework[key][field] = this.value;
            saveAsstData(asstData);
        });
    });
}

const ASST_TAB_KEY = 'asst_tab';
function initTabs() {
    const tabs = document.querySelectorAll('.asst-tab');
    const panes = document.querySelectorAll('.asst-pane');

    function activateTab(tabName) {
        tabs.forEach(t => t.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));
        const tab = [...tabs].find(t => t.dataset.tab === tabName) || tabs[0];
        if (!tab) return;
        tab.classList.add('active');
        const pane = document.getElementById('asst-pane-' + tab.dataset.tab);
        if (pane) pane.classList.add('active');
        if (tab.dataset.tab === 'predictions') renderPredictions();
        if (tab.dataset.tab === 'overview') renderOverview();
        if (tab.dataset.tab === 'ai') initAIPane();
    }

        try { activateTab(localStorage.getItem(ASST_TAB_KEY) || 'input'); } catch(e) { activateTab('input'); }

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            activateTab(this.dataset.tab);
            try { localStorage.setItem(ASST_TAB_KEY, this.dataset.tab); } catch(e) {}
        });
    });
}

const ASST_AI_DISCLAIMER_KEY = 'asst_ai_disclaimer_seen';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'openrouter/free';

let aiConversation = []; let aiSystemPrompt = '';

function buildAISystemPrompt() {
    const subjects = getActiveSubjects();
    const predictions = calcPredictions();
    ensureCW();

    const examLines = subjects.map(subj => {
        const papers = getPapersForSubject(subj);
        return papers.map(p => `  • ${subj} — ${p.component} (${p.date}, ${fmtDuration ? fmtDuration(p.durationMin) : p.durationMin+'min'}, ${p.board})`).join('\n');
    }).filter(Boolean).join('\n');

    const ppLines = subjects.map(subj => {
        const sd = asstData.subjects?.[subj];
        if (!sd?.pastPapers?.length) return null;
        const valid = sd.pastPapers.filter(p => p.pct !== '' && !isNaN(+p.pct));
        if (!valid.length) return null;
        return `  ${subj}:\n` + valid.map((p,i) => `    #${i+1}: ${p.pct}% (grade ${p.grade||'?'}, completed ${p.date||'?'})`).join('\n');
    }).filter(Boolean).join('\n');

    const predLines = Object.entries(predictions).map(([s,v]) => `  ${s}: ${v.pct.toFixed(1)}% → grade ${v.grade}`).join('\n');

    const cw = asstData.coursework || {};
    const cwLines = Object.keys(COURSEWORK).map(subject => {
        const ids = getCWFieldIds(subject);
        const data = cw[ids.key];
        if (!data?.pct && data?.pct !== 0 && data?.pct !== '0') return null;
        return `  ${courseworkLabel(subject)}: ${data.pct}% (grade ${data.grade||'?'})`;
    }).filter(Boolean).join('\n');

    return `You are a helpful GCSE revision assistant, whose name is Dale. Introduce yourself as Dale at the start of your conversation. Here is the student's data:

UPCOMING EXAMS:
${examLines || '  (none selected)'}

PAST PAPER PERFORMANCE:
${ppLines || '  (none entered)'}

${cwLines ? 'COMPLETED COURSEWORK:\n' + cwLines + '\n' : ''}PREDICTED GRADES:
${predLines || '  (insufficient data)'}

Give very concise, practical, exam-focused advice. Be encouraging but honest. Keep responses short due to token limitations. Ask if students want more in depth advice, and give it little by little.
Answer the questions the student asks. If they just say 'hello' or similar, just say a greeting concisely and ask what help they would like.`;
}

function aiAppendMessage(role, text) {
    const output = document.getElementById('asstAiOutput');
    if (!output) return;
        const placeholder = output.querySelector('.asst-ai-placeholder');
    if (placeholder) placeholder.remove();

    const div = document.createElement('div');
    div.className = 'asst-ai-msg asst-ai-msg-' + role;
        div.innerHTML = text
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
        .replace(/\n/g,'<br>');
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
}

async function aiSend(userText) {
    if (!userText.trim()) return;
    const sendBtn = document.getElementById('asstAiSend');
    const inputEl = document.getElementById('asstAiInput');

    aiConversation.push({ role: 'user', content: userText });
    aiAppendMessage('user', userText);
    if (inputEl) inputEl.value = '';
    if (sendBtn) sendBtn.disabled = true;

        const output = document.getElementById('asstAiOutput');
    const typing = document.createElement('div');
    typing.className = 'asst-ai-msg asst-ai-msg-assistant asst-ai-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    if (output) output.appendChild(typing);
    if (output) output.scrollTop = output.scrollHeight;

    try {
        const resp = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + (window._orKey || ''),
                'HTTP-Referer': window.location.href,
                'X-Title': 'GCSE Countdown Assistant',
            },
            body: JSON.stringify({
                model: OPENROUTER_MODEL,
                messages: [
                    { role: 'system', content: aiSystemPrompt },
                    ...aiConversation
                ],
                max_tokens: 600,
                stream: true,
            })
        });

        if (!resp.ok) {
            const errData = await resp.json().catch(() => ({}));
            if (typing.parentNode) typing.parentNode.removeChild(typing);
            aiAppendMessage('assistant', '⚠ API error ' + resp.status + ': ' + (errData.error?.message || resp.statusText));
            if (sendBtn) sendBtn.disabled = false;
            return;
        }

                if (typing.parentNode) typing.parentNode.removeChild(typing);
        const output = document.getElementById('asstAiOutput');
        const msgDiv = document.createElement('div');
        msgDiv.className = 'asst-ai-msg asst-ai-msg-assistant';
        if (output) { output.appendChild(msgDiv); output.scrollTop = output.scrollHeight; }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let fullReply = '';
        let buf = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            const lines = buf.split('\n');
            buf = lines.pop();             for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const raw = line.slice(6).trim();
                if (raw === '[DONE]') continue;
                try {
                    const chunk = JSON.parse(raw);
                    const delta = chunk.choices?.[0]?.delta?.content;
                    if (delta) {
                        fullReply += delta;
                        msgDiv.innerHTML = fullReply
                            .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                            .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
                            .replace(/\n/g,'<br>');
                        if (output) output.scrollTop = output.scrollHeight;
                    }
                } catch(e) { /* incomplete JSON chunk */ }
            }
        }

        if (fullReply) {
            aiConversation.push({ role: 'assistant', content: fullReply });
        } else {
            aiAppendMessage('assistant', '⚠ No response received.');
        }
    } catch(err) {
        if (typing.parentNode) typing.parentNode.removeChild(typing);
        aiAppendMessage('assistant', '⚠ Request failed: ' + err.message + '. Check your API key and network.');
    }
    if (sendBtn) sendBtn.disabled = false;
}

function initAIPane() {
    const disclaimer = document.getElementById('asstAiDisclaimer');
    const body = document.getElementById('asstAiBody');
    const disclaimerBtn = document.getElementById('asstAiDisclaimerBtn');
    if (!disclaimer || !body) return;

    const seen = localStorage.getItem(ASST_AI_DISCLAIMER_KEY) === '1';
    if (seen) {
        disclaimer.style.display = 'none';
        body.style.display = '';
        setupAIInput();
    } else {
        disclaimer.style.display = '';
        body.style.display = 'none';
        if (disclaimerBtn && !disclaimerBtn._bound) {
            disclaimerBtn._bound = true;
            disclaimerBtn.addEventListener('click', () => {
                localStorage.setItem(ASST_AI_DISCLAIMER_KEY, '1');
                disclaimer.style.display = 'none';
                body.style.display = '';
                setupAIInput();
            });
        }
    }
}

let aiInputSetup = false;
function setupAIInput() {
    if (aiInputSetup) return;
    aiInputSetup = true;

        if (!window._orKey) {
        const stored = localStorage.getItem('asst_or_key');
        if (stored) {
            window._orKey = stored;
        } else {
            const key = prompt('Enter your OpenRouter API key (stored locally in your browser, only sent to openrouter.ai). You can make one with your school account at openrouter.ai:');
            if (key) { window._orKey = key; localStorage.setItem('asst_or_key', key); }
        }
    }

        aiSystemPrompt = buildAISystemPrompt();

    const sendBtn = document.getElementById('asstAiSend');
    const inputEl = document.getElementById('asstAiInput');

    if (sendBtn && !sendBtn._bound) {
        sendBtn._bound = true;
        sendBtn.addEventListener('click', () => aiSend(inputEl?.value || ''));
    }
    if (inputEl && !inputEl._bound) {
        inputEl._bound = true;
        inputEl.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); aiSend(inputEl.value); }
        });
    }
}

function initExpand() {
    const btn = document.getElementById('assistantExpandBtn');
    const panel = document.getElementById('assistantPanel');
    if (!btn || !panel) return;
    btn.addEventListener('click', function() {
        panel.classList.toggle('expanded');
        this.textContent = panel.classList.contains('expanded') ? 'Collapse' : 'Expand';
    });
}

const _origRenderExams = window.renderExams;
if (typeof _origRenderExams === 'function') {
    window.renderExams = function() {
        _origRenderExams.apply(this, arguments);
                renderInputPane();
    };
}

function init() {
    initTabs();
    initExpand();
    renderCourseworkHTML();
    attachCourseworkEvents();
    renderInputPane();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

})();

function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}
function makeConfetti(coord_x) {
    const count = 200,
    defaults = {
        origin: { y: 1, x: coord_x},
    };

    function fire(particleRatio, opts) {
    confetti(
        Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio),
        })
    );
    }

    fire(0.25, {
    spread: 26,
    startVelocity: 55,
    });

    fire(0.2, {
    spread: 60,
    });

    fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    });

    fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    });

    fire(0.1, {
    spread: 120,
    startVelocity: 45,
    });
}

window.addEventListener("load", (e) => {
    if (activeFilters.size > 0) {
        const lastsavedfinished = load(FINISHED_EXAMS_KEY);
        let finishedExams = new Set();
        for (const exam in currentFiltered) {
            ex = (currentFiltered[exam]);
            if (getState(ex.start, ex.end, Date.now()) == "over") {
                finishedExams.add(`${ex.subject}: ${ex.component}`);
            }
        }
        save(FINISHED_EXAMS_KEY, finishedExams);
        if (finishedExams.difference(lastsavedfinished).size > 0) {
            makeConfetti(0);
            makeConfetti(0.125);
            makeConfetti(0.25);
            makeConfetti(0.5);
            makeConfetti(0.625);
            makeConfetti(0.75);
            makeConfetti(0.875);
            makeConfetti(1);
            const popup = document.createElement("div");

            popup.innerHTML = `
                <button id="popupCloseBtn">✕</button>

                <h2>🎉 Well done!</h2>

                <p>
                    You completed:
                </p>

                <div class="popup-exams">
                    ${Array.from(finishedExams.difference(lastsavedfinished))
                        .map(exam => `<div class="popup-exam">${exam}</div>`)
                        .join("")}
                </div>
            `;

            popup.querySelector("#popupCloseBtn").addEventListener("click", () => {
                popup.remove();
            });

            popup.setAttribute("id", "popup");
            document.body.appendChild(popup);
            setTimeout(() => {
                setSeaEffect(seaEffectEnabled);
            }, 1500);
        } else {
            setSeaEffect(seaEffectEnabled);
        }
    } else {
        setSeaEffect(seaEffectEnabled);
    }
});

// addEventListener("beforeunload", (e) => {
//     let finishedExams = new Set();
//     for (const exam in currentFiltered) {
//         ex = (currentFiltered[exam]);
//         if (getState(ex.start, ex.end, Date.now()) == "over") {
//             finishedExams.add(`${ex.subject}: ${ex.component}`)
//         }
//     }
//     save(FINISHED_EXAMS_KEY, finishedExams); //comment out for testing so you can just add other exams to test
// });

setAdvancedToggle(advancedToggle);
renderExams();
updatePrintBtnVisibility();
if (displayMode === DISPLAY_MODE_PROGRESS) renderProgressTracker();
updateClock();
setInterval(updateClock,100);
setInterval(updateTime, 100);
setInterval(tick,100);