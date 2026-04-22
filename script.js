const RAW_EXAMS = [
    {date:"06/05",board:"CIE",    level:"GCSE", code:"0990/11",        subject:"English Language",    component:"Paper 1 - Reading",                                                session:"PM",        durationMin:120},
    {date:"07/05",board:"CIE",    level:"GCSE", code:"0977/12",        subject:"History",                        component:"Paper 1 - Structured Questions",                        session:"AM",        durationMin:120},
    {date:"07/05",board:"WJEC", level:"GCSE", code:"C490/UA0-1", subject:"Electronics",                component:"Component 1 - Discovering Electronics",        session:"PM",        durationMin:90},
    {date:"07/05",board:"AQA",    level:"GCSE", code:"8662/LH",        subject:"German",                         component:"Paper 1 - Listening",                                            session:"PM",        durationMin:45},
    {date:"07/05",board:"AQA",    level:"GCSE", code:"8662/RH",        subject:"German",                         component:"Paper 3 - Reading",                                                session:"14:15", durationMin:60},
    {date:"08/05",board:"OCR",    level:"GCSE", code:"J282/01",        subject:"Latin",                            component:"Language Written Paper",                                     session:"11:00", durationMin:90},
    {date:"08/05",board:"CIE",    level:"GCSE", code:"0992/12",        subject:"English Literature", component:"Poetry and Prose",                                                 session:"AM",        durationMin:90},
    {date:"11/05",board:"CIE",    level:"GCSE", code:"0992/22",        subject:"English Literature", component:"Drama",                                                                        session:"AM",        durationMin:45},
    {date:"11/05",board:"CIE",    level:"GCSE", code:"0992/32",        subject:"English Literature", component:"Unseen",                                                                     session:"10:00", durationMin:75},
    {date:"11/05",board:"Pearson",level:"GCSE", code:"1CN0/1H",    subject:"Chinese",                        component:"Paper 1 - Listening Higher",                             session:"PM",        durationMin:45},
    {date:"11/05",board:"Pearson",level:"GCSE", code:"1CN0/3H",    subject:"Chinese",                        component:"Paper 3 - Reading Higher",                                 session:"14:15", durationMin:65},
    {date:"11/05",board:"OCR",    level:"GCSE", code:"J292/01",        subject:"Classical Greek",        component:"Language Written Paper",                                     session:"PM",        durationMin:90},
    {date:"12/05",board:"AQA",    level:"GCSE", code:"8062/11-17", subject:"Religious Studies",    component:"Paper 1",                                                                    session:"AM",        durationMin:105},
    {date:"12/05",board:"Pearson",level:"IGCSE",code:"4BI1/1B",    subject:"Biology",                        component:"Paper 1B",                                                                 session:"PM",        durationMin:120},
    {date:"13/05",board:"OCR",    level:"GCSE", code:"J384/01",        subject:"Geography",                    component:"Our Natural World",                                                session:"AM",        durationMin:75},
    {date:"13/05",board:"Pearson",level:"GCSE", code:"1CP2/01",    subject:"Computer Science",     component:"Paper 1 - Principles",                                         session:"PM",        durationMin:90},
    {date:"14/05",board:"Pearson",level:"IGCSE",code:"4MA1/1H",    subject:"Mathematics",                component:"Paper 1H Higher",                                                    session:"AM",        durationMin:120},
    {date:"14/05",board:"OCR",    level:"GCSE", code:"J198/01",        subject:"Ancient History",        component:"Greece and Persia",                                                session:"PM",        durationMin:120},
    {date:"14/05",board:"AQA",    level:"GCSE", code:"8662/WH",        subject:"German",                         component:"Paper 4 - Writing",                                                session:"PM",        durationMin:75},
    {date:"15/05",board:"CIE",    level:"GCSE", code:"0977/22",        subject:"History",                        component:"Paper 2 - Document Questions",                         session:"AM",        durationMin:105},
    {date:"15/05",board:"OCR",    level:"GCSE", code:"J282/03",        subject:"Latin",                            component:"Prose Literature B",                                             session:"PM",        durationMin:60},
    {date:"15/05",board:"WJEC", level:"GCSE", code:"C490/U20-1", subject:"Electronics",                component:"Component 2 - Application of Electronics", session:"PM",        durationMin:90},
    {date:"21/05",board:"CIE",    level:"GCSE", code:"0990/21",        subject:"English Language",     component:"Paper 2 - Directed Writing and Composition",session:"PM",     durationMin:120},
    {date:"18/05",board:"Pearson",level:"IGCSE",code:"4CH1/1C",    subject:"Chemistry",                    component:"Paper 1C",                                                                 session:"AM",        durationMin:120},
    {date:"18/05",board:"Pearson",level:"GCSE", code:"1CN0/4H",    subject:"Chinese",                        component:"Paper 4 - Writing Higher",                                 session:"PM",        durationMin:85},
    {date:"19/05",board:"Pearson",level:"GCSE", code:"1CP2/02",    subject:"Computer Science",     component:"Paper 2 - Computational Thinking",                 session:"PM",        durationMin:120},
    {date:"20/05",board:"AQA",    level:"GCSE", code:"8652/LH",        subject:"French",                         component:"Paper 1 - Listening",                                            session:"AM",        durationMin:45},
    {date:"20/05",board:"AQA",    level:"GCSE", code:"8652/RH",        subject:"French",                         component:"Paper 3 - Reading",                                                session:"10:15", durationMin:60},
    {date:"20/05",board:"AQA",    level:"GCSE", code:"8062/2A-2B", subject:"Religious Studies",    component:"Paper 2",                                                                    session:"PM",        durationMin:105},
    {date:"21/05",board:"CIE",    level:"GCSE", code:"0978/12",        subject:"Music",                            component:"Listening Paper 12",                                             session:"AM",        durationMin:75},
    {date:"22/05",board:"OCR",    level:"GCSE", code:"J198/02",        subject:"Ancient History",        component:"Rome and its Neighbours",                                    session:"AM",        durationMin:120},
    {date:"22/05",board:"AQA",    level:"GCSE", code:"8633/LH",        subject:"Italian",                        component:"Paper 1 - Listening",                                            session:"AM",        durationMin:45},
    {date:"22/05",board:"AQA",    level:"GCSE", code:"8633/RH",        subject:"Italian",                        component:"Paper 3 - Reading",                                                session:"10:15", durationMin:60},
    {date:"22/05",board:"OCR",    level:"GCSE", code:"J292/02",        subject:"Classical Greek",        component:"Prose Literature A",                                             session:"PM",        durationMin:60},
    {date:"01/06",board:"AQA",    level:"GCSE", code:"8633/WH",        subject:"Italian",                        component:"Paper 4 - Writing",                                                session:"AM",        durationMin:75},
    {date:"01/06",board:"OCR",    level:"GCSE", code:"J292/04",        subject:"Classical Greek",        component:"Verse Literature A",                                             session:"PM",        durationMin:60},
    {date:"02/06",board:"Pearson",level:"IGCSE",code:"4PH1/1P",    subject:"Physics",                        component:"Paper 1P",                                                                 session:"AM",        durationMin:120},
    {date:"02/06",board:"OCR",    level:"GCSE", code:"J282/05",        subject:"Latin",                            component:"Verse Literature B",                                             session:"PM",        durationMin:60},
    {date:"03/06",board:"Pearson",level:"IGCSE",code:"4MA1/2H",    subject:"Mathematics",                component:"Paper 2H Higher",                                                    session:"AM",        durationMin:120},
    {date:"03/06",board:"OCR",    level:"GCSE", code:"J384/02",        subject:"Geography",                    component:"People and Society",                                             session:"PM",        durationMin:75},
    {date:"04/06",board:"AQA",    level:"GCSE", code:"8652/WH",        subject:"French",                         component:"Paper 4 - Writing",                                                session:"PM",        durationMin:75},
    {date:"08/06",board:"Pearson",level:"IGCSE",code:"4BI1/2B",    subject:"Biology",                        component:"Paper 2B",                                                                 session:"AM",        durationMin:75},
    {date:"09/06",board:"AQA",    level:"GCSE", code:"8692/LH",        subject:"Spanish",                        component:"Paper 1 - Listening",                                            session:"AM",        durationMin:45},
    {date:"09/06",board:"AQA",    level:"GCSE", code:"8692/RH",        subject:"Spanish",                        component:"Paper 3 - Reading",                                                session:"10:00", durationMin:60},
    {date:"10/06",board:"WJEC", level:"GCSE", code:"603/1121/6", subject:"S&C / PD",                     component:"D&T in the 21st Century",                                    session:"PM",        durationMin:120},
    {date:"11/06",board:"OCR",    level:"GCSE", code:"J384/03",        subject:"Geography",                    component:"Geographical Exploration",                                 session:"AM",        durationMin:90},
    {date:"12/06",board:"Pearson",level:"IGCSE",code:"4CH1/2C",    subject:"Chemistry",                    component:"Paper 2C",                                                                 session:"AM",        durationMin:75},
    {date:"15/06",board:"Pearson",level:"IGCSE",code:"4PH1/2P",    subject:"Physics",                        component:"Paper 2P",                                                                 session:"AM",        durationMin:75},
    {date:"16/06",board:"AQA",    level:"GCSE", code:"8692/WH",        subject:"Spanish",                        component:"Paper 4 - Writing",                                                session:"AM",        durationMin:75},
    {date:"08/05",board:"WJEC", level:"GCSE", code:"601/8420/6", subject:"Drama",                            component:"Interpreting Theatre",                                         session:"PM",        durationMin:90},
];
const MAX_DAYS = 60;

// ── Subject categories ──────────────────────────────────────────────────────
const CATEGORIES = [
    { name: "Essentials",    subjects: ["Biology", "Chemistry", "Physics", "Mathematics", "English Language", "English Literature"] },
    { name: "MFL",             subjects: ["French", "German", "Spanish", "Italian", "Chinese"] },
    { name: "Classics",    subjects: ["Latin", "Classical Greek", "Ancient History"] },
    { name: "Humanities",subjects: ["History", "Geography", "Religious Studies"] },
    { name: "Creatives",    subjects: ["Music", "Drama", "Electronics", "S&C / PD", "Computer Science"] },
];

const STORAGE_KEY = 'filters_v3';
const COMPACT_KEY = 'compact_mode';
const CAL_KEY = 'calendar_mode';
const PLANNER_KEY = 'planner';

function saveFilters() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...activeFilters])); } catch(e){} }
function loadFilters() { try { const r=localStorage.getItem(STORAGE_KEY); return r?new Set(JSON.parse(r)):new Set(); } catch(e){ return new Set(); } }
function saveCompact(v) { try { localStorage.setItem(COMPACT_KEY, v?'1':'0'); } catch(e){} }
function loadCompact() { try { return localStorage.getItem(COMPACT_KEY)==='1'; } catch(e){ return false; } }
function saveCal(active) {try {return localStorage.setItem(CAL_KEY, active ? 1 : 0);} catch(e) {return false;}}
function loadCal() {try {return localStorage.getItem(CAL_KEY) == 1;} catch(e) {return false;}}
function savePlanner(keys) {try {return localStorage.setItem(PLANNER_KEY, JSON.stringify(keys));} catch(e) {return false;}}
function loadPlanner() {try {return localStorage.getItem(PLANNER_KEY)} catch(e) {return false;}}

function makeStart(dateStr, session) {
    const [d,m]=dateStr.split('/').map(Number);
    let hours,minutes;
    if(session==='AM'||session==='PM'){hours=session==='AM'?9:13;minutes=session==='AM'?15:30;}
    else [hours,minutes]=session.split(':');
    return new Date(2026,m-1,d,+hours,+minutes,0,0);
}

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

const exams=RAW_EXAMS.map(e=>{
    const start=makeStart(e.date,e.session);
    const end=new Date(start.getTime()+e.durationMin*60000);
    return{...e,start,end};
}).sort((a,b)=>a.start-b.start);

// Collect all subjects that actually appear in the data
const ALL_SUBJECTS=[...new Set(exams.map(e=>e.subject))];

let activeFilters=loadFilters();
let lastFilterCount = activeFilters.size;
activeFilters.forEach(s=>{if(!ALL_SUBJECTS.includes(s))activeFilters.delete(s);});

let calMode = loadCal();
if (calMode) {document.body.classList.replace('compact', 'cal') ? null:document.body.classList.add('cal')};

let compactMode = calMode ? 0:loadCompact();
if(compactMode) {document.body.classList.replace('cal', 'compact') ? null:document.body.classList.add('compact')};

let plannerMode = 0;

// ── DOM refs ─────────────────────────────────────────────────────────────────
const clearBtnWrap = document.getElementById('clearBtnWrap');
const filterCountEl = document.getElementById('filterCount');
const compactbtn = document.getElementById('compactbtn');
const calbtn = document.getElementById('calbtn');
const filterCatsEl = document.getElementById('filterCategories');
const plannerbtn = document.getElementById('rev-planner');
const modebtn = document.querySelector('.switch input')

if(compactMode) compactbtn.classList.add('active');
if(calMode) calbtn.classList.add('active');

calbtn.addEventListener('click',()=>{
    calMode=!calMode;
    compactMode=0;
    compactbtn.classList.remove('active');
    document.body.classList.remove('compact');
    document.body.classList.toggle('cal',calMode);
    calbtn.classList.toggle('active',calMode);
    saveCal(calMode);
    saveCompact(compactMode);
    renderExams();
});

compactbtn.addEventListener('click',()=>{
    compactMode=!compactMode;
    calMode=0;
    calbtn.classList.remove('active');
    document.body.classList.remove('cal');
    document.body.classList.toggle('compact',compactMode);
    compactbtn.classList.toggle('active',compactMode);
    saveCompact(compactMode);
    saveCal(calMode);
    renderExams();
});

plannerbtn.addEventListener('click', e => {
    plannerMode=!plannerMode;
    plannerbtn.classList.toggle('active', plannerMode);
    toggleOtherStates();
})

modebtn.addEventListener('change', e => {
    document.documentElement.classList.toggle('light')
})

// ── Smooth clear button animation ────────────────────────────────────────────
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

// ── Build filter UI by category ───────────────────────────────────────────────
// Track subject→button map for toggling
const subjectBtnMap={};

// Check if all subjects in a category are currently active
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

    // Category header
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
        updateClearBtn(); updateFilterCount(); saveFilters(); renderExams();
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
            updateClearBtn(); updateFilterCount(); saveFilters(); renderExams();
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
    updateClearBtn(); updateFilterCount(); saveFilters(); renderExams();
});

// Init clear btn without animation
clearBtnWrap.style.transition='none';
clearBtnWrap.style.height=activeFilters.size>0?'auto':'0';
clearBtnWrap.style.marginTop=activeFilters.size>0?'12px':'0';
if(activeFilters.size>0)clearBtnWrap.classList.add('open');
updateFilterCount();

let monthOffset = 0

// ── Render ────────────────────────────────────────────────────────────────────
let currentFiltered = exams.slice();

function renderExams(){
    const list=document.getElementById('examList'),
        emptyEl=document.getElementById('emptyState'),
        countInfo=document.getElementById('countInfo');
    list.innerHTML='';
    const now=Date.now();
    const filtered=activeFilters.size===0?exams:exams.filter(e=>activeFilters.has(e.subject));
    currentFiltered = filtered;
    if(!filtered.length){emptyEl.style.display='block';countInfo.textContent='';return;}

    emptyEl.style.display='none';
    const upcoming =filtered.filter(e=>getState(e.start,e.end,now)==='upcoming');
    const inprogress = filtered.filter(e=>getState(e.start,e.end,now)==='inprogress');
    const over =filtered.filter(e=>getState(e.start,e.end,now)==='over');

    countInfo.innerHTML=
        `Showing <strong>${filtered.length}</strong> exam${filtered.length!==1?'s':''} &nbsp;·&nbsp; `+
        `<strong>${over.length}</strong> over &nbsp;·&nbsp; `+
        `<strong>${inprogress.length}</strong> in progress &nbsp;·&nbsp; `+
        `<strong>${upcoming.length}</strong> upcoming`;
    
    const halfTermStart = new Date(2026,4,23).getTime(); // 23 May 2026
    const active = [...inprogress,...upcoming];
    let halfTermInserted = false;

    if (!calMode) {
        active.forEach((e,i)=>{
            if(!halfTermInserted && e.start.getTime() >= halfTermStart){
                const div=document.createElement('div');
                div.className='section-divider half-term-divider';
                div.innerHTML='🌿 Half Term';
                list.appendChild(div);
                halfTermInserted=true;
            }
            list.appendChild(makeCard(e,i));
        });
        if(over.length){
            const div=document.createElement('div');div.className='section-divider';div.textContent='Exam Over';
            list.appendChild(div);
            over.slice().reverse().forEach((e,i)=>list.appendChild(makeCard(e,inprogress.length+upcoming.length+i)));
        }
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
            //console.log(date);
            let table = '<table id="calendar"><tr><th>MONDAY</th><th>TUESDAY</th><th>WEDNESDAY</th><th>THURSDAY</th><th>FRIDAY</th><th>SATURDAY</th><th>SUNDAY</th></tr><tr>';
            // spaces for the first row
            for (let i = 0; i < getDay(date); i++) {table += '<td id="0 0">'+'</td>';}
            // <td> with actual dates
            while (date.getMonth() == curMonth) {
                if (date.getFullYear() == today.getFullYear() && date.getMonth() == today.getMonth() && date.getDate() == today.getDate()) {
                    table += '<td class="curMonth today" id="' + date.getDate() + " "+ date.getMonth() + '">' + date.getDate() + '</td>';
                } else {
                    table += '<td class="curMonth" id="' + date.getDate() + " "+ date.getMonth() + '">' + date.getDate() + '</td>';
                }
                if (getDay(date) % 7 == 6) {table += '</tr><tr>';}
                date.setDate(date.getDate() + 1);
            }
            // add spaces after last days of month for the last row
            if (getDay(date) != 0) {
                for (let i = getDay(date); i < 7; i++) {
                    table += '<td class="nextMonth" id="' + date.getDate() + " " + date.getMonth() + '">' + Number(date.getDate()) + '</td>';
                    date.setDate(date.getDate() + 1);
                }
            }
            // close the table
            table += '</tr></table>';
            div.innerHTML = table;
            list.appendChild(div);
        }
        
        function addExams() {
            let table = document.getElementById("calendar");
            for (let i=1, row; row=table.rows[i]; i++) {
                for (let j=0, col; col=row.cells[j]; j++) {
                    let nday = Number(col.id.split(" ")[0])
                    let nmonth = Number(col.id.split(" ")[1]) + 1
                    //console.log(active);
                    let examsOnDay = active.filter(e => [...e.date.split("/")][0] == nday && [...e.date.split("/")][1] == nmonth);
                    if (examsOnDay.length > 0) {
                        for (let i=0; i<examsOnDay.length; i++) {
                            const ex = examsOnDay[i];
                            const examDiv = document.createElement('div');
                            examDiv.className = 'cal-exam';
                            const now = Date.now();
                            const state = getState(ex.start, ex.end, now);
                            const statusBadge = state === 'inprogress'
                                ? `<span class="status-badge inprogress">● IN PROGRESS</span>`
                                : state === 'over' ? `<span class="status-badge over">EXAM OVER</span>` : '';
                            const msLeft = ex.start - now;
                            const timerText = state === 'upcoming' ? fmtCountdown(msLeft) : '–';
                            examDiv.innerHTML = `<span class="cal-exam-subject">${ex.subject}</span><span class="cal-exam-component">${ex.component}</span>`;
                            examDiv.innerHTML += `<div class="cal-exam-tooltip">
                                <div class="cal-tooltip-top">
                                    <div class="cal-tooltip-title-block">
                                        <span class="exam-subject">${ex.subject}</span>
                                        <span class="exam-component">${ex.component}</span>
                                    </div>
                                    ${statusBadge}
                                </div>
                                <div class="exam-meta">
                                    <span class="badge">${ex.date}/26</span>
                                    <span class="badge">${ex.board} ${ex.level}</span>
                                    <span class="badge">${ex.code}</span>
                                    <span class="badge">${fmtTime(ex.start)} – ${fmtTime(ex.end)}</span>
                                    <span class="badge">⏱ ${fmtDuration(ex.durationMin)}</span>
                                </div>
                                <div class="countdown-block">
                                    <span class="countdown-timer${state !== 'upcoming' ? ' dim' : ''}" data-code="${ex.code}">${timerText}</span>
                                    <div class="progress-wrap"><div class="progress-bar" data-bar="${ex.code}" style="width:${(getFrac(msLeft)*100).toFixed(3)}%;background:${fracToColor(getFrac(msLeft))}"></div></div>
                                </div>
                            </div>`;
                            col.appendChild(examDiv);
                        }
                    }
                    //console.log(col);
                    //console.log(examsOnDay)
                }
            }
        }
        createCalendar(offsetDate.valueOf());
        addExams();
    }
}

function makeCard(e,idx){
    const now=Date.now(),state=getState(e.start,e.end,now),msLeft=e.start-now;
    const frac=state==='upcoming'?getFrac(msLeft):0;
    const color=state==='upcoming'?fracToColor(frac):state==='inprogress'?'#a855f7':'#3b82f6';
    const card=document.createElement('div');
    card.className=`exam-card state-${state}`;
    card.style.borderLeftColor=color;
    card.style.animationDelay=`${Math.min(idx*20,300)}ms`;
    card.dataset.code=e.code;
    const timerText=state==='upcoming'?fmtCountdown(msLeft):'–';
    const statusBadge=state==='inprogress'
        ?`<span class="status-badge inprogress">● IN PROGRESS</span>`
        :state==='over'?`<span class="status-badge over">EXAM OVER</span>`:'';
    card.innerHTML=`
        <div class="exam-top">
            <div class="exam-title-block">
                <span class="exam-subject">${e.subject}</span>
                <span class="exam-component">${e.component}</span>
            </div>
            ${statusBadge}
        </div>
        <div class="exam-meta">
            <span class="badge">${e.date}/26</span>
            <span class="badge">${e.board} ${e.level}</span>
            <span class="badge">${e.code}</span>
            <span class="badge">${fmtTime(e.start)} – ${fmtTime(e.end)}</span>
            <span class="badge">⏱ ${fmtDuration(e.durationMin)}</span>
        </div>
        <div class="countdown-block">
            <span class="countdown-timer${state!=='upcoming'?' dim':''}" data-code="${e.code}">${timerText}</span>
            <div class="progress-wrap"><div class="progress-bar" data-bar="${e.code}" style="width:${(frac*100).toFixed(3)}%;background:${color}"></div></div>
        </div>`;
    return card;
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

let prevStates={};
exams.forEach(e=>{prevStates[e.code]=getState(e.start,e.end,Date.now());});

function tick(){
    const now=Date.now();
    let firstPassed = false;
    let changed=false;
    exams.forEach(e=>{const s=getState(e.start,e.end,now);if(prevStates[e.code]!==s){prevStates[e.code]=s;changed=true;}});
    if(changed){renderExams();return;}

    const first = currentFiltered.length ? currentFiltered[0] : null;
    if (first) {
        document.getElementById('remtime').textContent = fmtCountdown(first.start - now);
    }
    const last = currentFiltered.length ? currentFiltered[currentFiltered.length - 1] : null;
    if (last) {
        document.getElementById('endremtime').textContent = fmtCountdown(last.end - now);
    }

    document.querySelectorAll('[data-code]').forEach(el=>{
        if(!el.classList.contains('countdown-timer'))return;
        const exam=exams.find(x=>x.code===el.dataset.code);
        if(!exam||getState(exam.start,exam.end,now)!=='upcoming')return;
        const msLeft=exam.start-now;
        el.textContent=fmtCountdown(msLeft);
        const frac=getFrac(msLeft),color=fracToColor(frac);
        const bar=document.querySelector(`[data-bar="${exam.code}"]`);
        if(bar){bar.style.width=(frac*100).toFixed(3)+'%';bar.style.background=color;}
        const card=el.closest('.exam-card');
        if(card)card.style.borderLeftColor=color;
    });
}

renderExams();
updateClock();
setInterval(updateClock,100);
setInterval(updateTime, 100);
setInterval(tick,100);

// Calendar tooltip flip-direction: check on mouseenter so tooltip doesn't overflow viewport
document.getElementById('examList').addEventListener('mouseenter', e => {
    const pill = e.target.closest('.cal-exam');
    if (!pill) return;
    const tooltip = pill.querySelector('.cal-exam-tooltip');
    if (!tooltip) return;
    // Reset first
    pill.classList.remove('flip-up', 'flip-left');
    tooltip.style.display = 'block';
    const tr = tooltip.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    if (tr.bottom > vh - 10) pill.classList.add('flip-up');
    if (tr.right > vw - 10) pill.classList.add('flip-left');
    tooltip.style.display = '';
}, true);
