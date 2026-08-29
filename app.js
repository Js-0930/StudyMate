const STORE="studymate_v12";
const subjects=["수학","국어","영어","물리","화학","탐구","기타"];
const motivations=[
["오늘의 작은 집중이<br><strong>내일의 실력을 만듭니다.</strong>","천 리 길도 한 걸음부터.","— 고전 격언"],
["완벽하게 하려고 하지 말고<br><strong>일단 시작해보세요.</strong>","두려워도 앞으로 나아가라.","— 제천대성의 기개"],
["지금 쌓는 1시간이<br><strong>미래의 나를 바꿉니다.</strong>","오늘의 땀은 내일의 힘이 된다.","— 제천대성의 기개"],
["조금 느려도 괜찮아요.<br><strong>멈추지만 않으면 됩니다.</strong>","넘어졌다면 다시 일어나 앞으로 가라.","— 제천대성의 기개"],
["남과 비교하지 말고<br><strong>어제의 나를 넘어보세요.</strong>","남을 이기는 것보다 자신을 이기는 것이 어렵다.","— 고전 격언"],
["해야 할 일을 미루지 마세요.<br><strong>지금 한 번 더 해보세요.</strong>","강한 자는 포기하지 않는다.","— 제천대성의 기개"],
["오늘 공부한 만큼<br><strong>내일의 선택지가 늘어납니다.</strong>","실력은 하루아침에 생기지 않는다.","— 고전 격언"],
["집중할 수 있는 지금,<br><strong>딱 10분만 먼저 시작해요.</strong>","첫걸음을 내딛는 순간 길이 열린다.","— 제천대성의 기개"],
["결과를 걱정하지 말고<br><strong>지금 할 일에 집중하세요.</strong>","끝까지 버티는 자가 결국 웃는다.","— 제천대성의 기개"],
["힘든 날에도 앉아 있는 것,<br><strong>그것도 실력입니다.</strong>","오늘 견딘 한계가 내일의 실력이 된다.","— 제천대성의 기개"],
["오늘의 목표는 하나씩.<br><strong>끝까지 해내면 됩니다.</strong>","포기하지 않는 마음이 가장 강한 무기다.","— 제천대성의 기개"],
["공부는 재능보다<br><strong>꾸준함이 오래 갑니다.</strong>","천 번의 연습보다 중요한 것은 오늘의 한 번이다.","— 고전 격언"]
];
let state=JSON.parse(localStorage.getItem(STORE)||"null");
if(!state){
 state={plans:[],sessions:[],theme:"light",dday:{name:"",date:""}};
}
state.dday=state.dday||{name:"",date:""};
// 이전 버전 데이터 호환
state.plans=state.plans.map(p=>({...p,date:p.date||new Date().toISOString().slice(0,10)}));
let running=false,startAt=0,currentSubject=null,interval=null,currentFilter="all";

const $=id=>document.getElementById(id);
const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
function save(){localStorage.setItem(STORE,JSON.stringify(state))}
function safe(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function secToday(){return state.sessions.filter(x=>x.date===todayKey()).reduce((a,x)=>a+x.seconds,0)}
function secWeek(){return state.sessions.filter(x=>{const d=Date.now()-new Date(x.date+"T00:00:00").getTime();return d>=0&&d<7*864e5}).reduce((a,x)=>a+x.seconds,0)}
function fmtTime(s){s=Math.floor(s);return [Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(x=>String(x).padStart(2,"0")).join(":")}
function fmtMin(s){const m=Math.floor(s/60);if(m<60)return m+"분";return Math.floor(m/60)+"시간 "+m%60+"분"}
function localDateLabel(){return new Date().toLocaleDateString("ko-KR",{month:"long",day:"numeric",weekday:"short"})}
function motivation(){
 const start=new Date(new Date().getFullYear(),0,0);
 const day=Math.floor((new Date()-start)/864e5);
 const item=motivations[day%motivations.length];
 $("motivation").innerHTML=`<div class="motivation-main">${item[0]}</div>
 <div class="motivation-quote">
   <div class="motivation-quote-text">“${item[1]}”</div>
   <div class="motivation-quote-author">${item[2]}</div>
 </div>`;
}
function renderDday(){
 const d=state.dday;
 $("ddayName").value=d.name||"";
 $("ddayDateInput").value=d.date||"";
 if(!d.date){$("ddayTitle").textContent="목표 날짜를 설정해보세요";$("ddayValue").textContent="D-DAY";$("ddayDate").textContent="날짜를 설정하면 여기 표시됩니다.";return}
 const target=new Date(d.date+"T00:00:00"),today=new Date(todayKey()+"T00:00:00");
 const diff=Math.ceil((target-today)/864e5);
 $("ddayTitle").textContent=d.name||"나의 목표";
 $("ddayValue").textContent=diff>0?"D-"+diff:diff===0?"D-DAY":"D+"+Math.abs(diff);
 $("ddayDate").textContent=target.toLocaleDateString("ko-KR",{year:"numeric",month:"long",day:"numeric"});
}
function render(){
 $("dateText").textContent=localDateLabel();motivation();renderDday();
 const today=secToday(),plans=state.plans.filter(p=>p.date===todayKey()),done=plans.filter(p=>p.done).length,total=plans.length;
 $("todayTime").textContent=fmtMin(today);$("weekTime").textContent=fmtMin(secWeek());
 $("rate").textContent=(total?Math.round(done/total*100):0)+"%";$("doneCount").textContent=done;$("totalCount").textContent=total;
 $("todayDelta").textContent=total?`${plans.reduce((a,p)=>a+p.minutes,0)}분 목표`:"목표를 세워보세요";
 renderPlans();renderSubjects();renderWeek();
}
function renderPlans(){
 const arr=state.plans.filter(p=>p.date===todayKey()).filter(p=>currentFilter==="all"||currentFilter==="done"&&p.done||currentFilter==="todo"&&!p.done);
 $("plans").innerHTML=arr.length?arr.map(p=>`<div class="plan ${p.done?"done":""}">
 <button class="check" onclick="togglePlan('${p.id}')" aria-label="완료"></button>
 <div class="pbody"><div class="subject">${safe(p.subject)}</div><div class="task">${safe(p.task)}</div></div>
 <div class="target">${p.minutes}분</div><button class="delete" onclick="removePlan('${p.id}')" aria-label="삭제">×</button></div>`).join(""):`<div class="empty">${currentFilter==="done"?"완료한 계획이 아직 없어요.":"오늘 할 공부를 추가해보세요."}</div>`;
}
function togglePlan(id){const p=state.plans.find(x=>x.id===id);if(p){p.done=!p.done;save();render();toast(p.done?"계획 완료! 🎉":"완료 취소")}}
function removePlan(id){state.plans=state.plans.filter(x=>x.id!==id);save();render();toast("계획을 삭제했어요.")}
function subjectSeconds(s){return state.sessions.filter(x=>x.date===todayKey()&&x.subject===s).reduce((a,x)=>a+x.seconds,0)}
function renderSubjects(){
 const sums=Object.fromEntries(subjects.map(s=>[s,subjectSeconds(s)])),max=Math.max(60,...Object.values(sums));
 $("subjectStats").innerHTML=subjects.map(s=>`<div class="srow">
 <div class="shead"><span class="sname">${s} · ${fmtMin(sums[s])}</span>
 <button class="subject-start ${running&&currentSubject===s?"active":""}" onclick="startSubject('${s}')">${running&&currentSubject===s?"STOP":"START"}</button></div>
 <div class="sbar"><div class="sfill" style="width:${Math.min(100,sums[s]/max*100)}%"></div></div>
 </div>`).join("");
}
function renderWeek(){
 const days=[];for(let i=6;i>=0;i--){const d=new Date(Date.now()-i*864e5),key=d.toISOString().slice(0,10),v=state.sessions.filter(x=>x.date===key).reduce((a,x)=>a+x.seconds,0);days.push({v,label:d.toLocaleDateString("ko-KR",{weekday:"short"})})}
 const max=Math.max(60,...days.map(x=>x.v)),best=days.reduce((a,b)=>b.v>a.v?b:a,days[0]);
 $("bestDay").textContent=best.v?`최고 ${best.label} · ${fmtMin(best.v)}`:"기록 없음";
 $("weekBars").innerHTML=days.map(x=>`<div class="day"><strong>${x.v?Math.floor(x.v/60)+"′":""}</strong><i style="height:${Math.max(3,x.v/max*90)}px"></i><b>${x.label}</b></div>`).join("");
}
function toast(t){const el=$("toast");el.textContent=t;el.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove("show"),1800)}
function tick(){const elapsed=(Date.now()-startAt)/1000;$("timer").textContent=fmtTime(elapsed)}
function startSubject(subject){
 if(running&&currentSubject===subject){stopTimer();return}
 if(running){stopTimer(false)}
 running=true;currentSubject=subject;startAt=Date.now();
 $("timerSubject").textContent=subject+" 집중 중";$("timerBtn").textContent="현재 공부 종료";
 interval=setInterval(tick,250);renderSubjects();toast(subject+" 공부 시작! 🔥");
}
function stopTimer(show=true){
 if(!running)return;
 const seconds=Math.floor((Date.now()-startAt)/1000);
 clearInterval(interval);interval=null;running=false;
 if(seconds>=1)state.sessions.push({date:todayKey(),seconds,subject:currentSubject});
 const ended=currentSubject;currentSubject=null;$("timer").textContent="00:00:00";$("timerSubject").textContent="과목을 선택해 공부하세요";$("timerBtn").textContent="공부 시작";
 save();render();if(show)toast(`${ended} ${fmtMin(seconds)} 기록 완료!`);
}
$("timerBtn").onclick=()=>running?stopTimer():toast("오른쪽 과목별 START 버튼에서 과목을 선택해주세요.");
$("timerReset").onclick=()=>{if(running){clearInterval(interval);interval=null;running=false;currentSubject=null}$("timer").textContent="00:00:00";$("timerSubject").textContent="과목을 선택해 공부하세요";$("timerBtn").textContent="공부 시작";renderSubjects();toast("타이머를 리셋했어요. 기록은 저장되지 않습니다.")};
$("addBtn").onclick=()=>{$("planForm").classList.toggle("hidden");if(!$("planForm").classList.contains("hidden"))$("task").focus()};
$("savePlan").onclick=()=>{
 const task=$("task").value.trim(),minutes=Number($("minutes").value);
 if(!task||!Number.isFinite(minutes)||minutes<1||minutes>1440){toast("내용과 목표 시간을 올바르게 입력해주세요.");return}
 state.plans.push({id:crypto.randomUUID?crypto.randomUUID():Date.now()+"",subject:$("subject").value,task,minutes,done:false,date:todayKey()});
 $("task").value="";$("minutes").value="";$("planForm").classList.add("hidden");save();render();toast("오늘 계획을 추가했어요.")
};
$("task").addEventListener("keydown",e=>{if(e.key==="Enter")$("savePlan").click()});
document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");currentFilter=b.dataset.filter;renderPlans()});
$("ddaySave").onclick=()=>{
 const name=$("ddayName").value.trim(),date=$("ddayDateInput").value;
 if(!date){toast("D-Day 날짜를 선택해주세요.");return}
 state.dday={name:name||"나의 목표",date};save();renderDday();toast("D-Day를 설정했어요! 🎯");
};
$("themeBtn").onclick=()=>{state.theme=state.theme==="dark"?"light":"dark";document.body.classList.toggle("dark",state.theme==="dark");$("themeBtn").textContent=state.theme==="dark"?"☀":"☾";save()};
document.body.classList.toggle("dark",state.theme==="dark");$("themeBtn").textContent=state.theme==="dark"?"☀":"☾";
render();