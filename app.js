const STORE="studymate_v1";const subjects=["수학","국어","영어","물리","화학","탐구","기타"];
let state=JSON.parse(localStorage.getItem(STORE)||"null")||{plans:[],sessions:[],theme:"light"};
let running=false,startAt=0,interval=null,currentFilter="all";
const $=id=>document.getElementById(id);
const todayKey=()=>new Date().toISOString().slice(0,10);
function save(){localStorage.setItem(STORE,JSON.stringify(state))}
function safe(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function secToday(){return state.sessions.filter(x=>x.date===todayKey()).reduce((a,x)=>a+x.seconds,0)}
function secWeek(){const n=Date.now();return state.sessions.filter(x=>n-new Date(x.date+"T00:00:00").getTime()<7*864e5).reduce((a,x)=>a+x.seconds,0)}
function fmtTime(s){s=Math.floor(s);return [Math.floor(s/3600),Math.floor(s%3600/60),s%60].map((x,i)=>String(x).padStart(2,"0")).join(":")}
function fmtMin(s){const m=Math.floor(s/60);if(m<60)return m+"분";return Math.floor(m/60)+"시간 "+m%60+"분"}
function render(){
 $("dateText").textContent=new Date().toLocaleDateString("ko-KR",{month:"long",day:"numeric",weekday:"short"});
 const today=secToday(),done=state.plans.filter(p=>p.done).length,total=state.plans.length;
 $("todayTime").textContent=fmtMin(today);$("weekTime").textContent=fmtMin(secWeek());
 $("rate").textContent=(total?Math.round(done/total*100):0)+"%";$("doneCount").textContent=done;$("totalCount").textContent=total;
 $("todayDelta").textContent=total?`${state.plans.reduce((a,p)=>a+p.minutes,0)}분 목표`:"목표를 세워보세요";
 renderPlans();renderSubjects();renderWeek();
}
function renderPlans(){
 let arr=state.plans.filter(p=>currentFilter==="all"||currentFilter==="done"&&p.done||currentFilter==="todo"&&!p.done);
 $("plans").innerHTML=arr.length?arr.map(p=>`<div class="plan ${p.done?"done":""}">
 <button class="check" onclick="togglePlan('${p.id}')" aria-label="완료"></button>
 <div class="pbody"><div class="subject">${safe(p.subject)}</div><div class="task">${safe(p.task)}</div></div>
 <div class="target">${p.minutes}분</div><button class="delete" onclick="removePlan('${p.id}')" aria-label="삭제">×</button></div>`).join(""):`<div class="empty">${currentFilter==="done"?"완료한 계획이 아직 없어요.":"오늘 할 공부를 추가해보세요."}</div>`;
}
function togglePlan(id){const p=state.plans.find(x=>x.id===id);if(p){p.done=!p.done;save();render();toast(p.done?"계획 완료! 🎉":"완료 취소")}}
function removePlan(id){state.plans=state.plans.filter(x=>x.id!==id);save();render();toast("계획을 삭제했어요.")}
function renderSubjects(){
 const sums=Object.fromEntries(subjects.map(s=>[s,0]));
 state.sessions.forEach(x=>{sums[x.subject]=(sums[x.subject]||0)+x.seconds});
 const max=Math.max(60,...Object.values(sums));
 $("subjectStats").innerHTML=subjects.map(s=>`<div class="srow"><div class="shead"><span>${s}</span><span>${fmtMin(sums[s])}</span></div><div class="sbar"><div class="sfill" style="width:${Math.min(100,sums[s]/max*100)}%"></div></div></div>`).join("");
}
function renderWeek(){
 const days=[];for(let i=6;i>=0;i--){const d=new Date(Date.now()-i*864e5),key=d.toISOString().slice(0,10),v=state.sessions.filter(x=>x.date===key).reduce((a,x)=>a+x.seconds,0);days.push({key,v,label:d.toLocaleDateString("ko-KR",{weekday:"short"}).replace(".","")})}
 const max=Math.max(60,...days.map(x=>x.v));let best=days.reduce((a,b)=>b.v>a.v?b:a,days[0]);
 $("bestDay").textContent=best.v?`최고 ${best.label} · ${fmtMin(best.v)}`:"기록 없음";
 $("weekBars").innerHTML=days.map(x=>`<div class="day"><strong>${x.v?Math.floor(x.v/60)+"′":""}</strong><i style="height:${Math.max(3,x.v/max*90)}px"></i><b>${x.label}</b></div>`).join("");
}
function toast(t){const el=$("toast");el.textContent=t;el.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove("show"),1800)}
$("addBtn").onclick=()=>{$("planForm").classList.toggle("hidden");if(!$("planForm").classList.contains("hidden"))$("task").focus()}
$("savePlan").onclick=()=>{
 const task=$("task").value.trim(),minutes=Number($("minutes").value);
 if(!task||!minutes||minutes<1){toast("내용과 목표 시간을 입력해주세요.");return}
 state.plans.push({id:crypto.randomUUID?crypto.randomUUID():Date.now()+"",subject:$("subject").value,task,minutes,done:false});
 $("task").value="";$("minutes").value="";$("planForm").classList.add("hidden");save();render();toast("계획을 추가했어요.")
};
$("task").addEventListener("keydown",e=>{if(e.key==="Enter")$("savePlan").click()});
document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");currentFilter=b.dataset.filter;renderPlans()});
function tick(){$("timer").textContent=fmtTime((Date.now()-startAt)/1000)}
$("timerBtn").onclick=()=>{
 if(!running){running=true;startAt=Date.now();$("timerBtn").textContent="공부 종료";interval=setInterval(tick,250);toast("집중 시작! 🔥")}
 else{
  const seconds=Math.floor((Date.now()-startAt)/1000);if(seconds<3){toast("조금 더 집중해보세요!");return}
  state.sessions.push({date:todayKey(),seconds,subject:"기타"});running=false;clearInterval(interval);$("timer").textContent="00:00:00";$("timerBtn").textContent="공부 시작";save();render();toast(`${fmtMin(seconds)} 기록 완료!`)
 }
};
$("timerReset").onclick=()=>{if(running){running=false;clearInterval(interval)}$("timer").textContent="00:00:00";$("timerBtn").textContent="공부 시작";toast("타이머를 리셋했어요.")};
$("themeBtn").onclick=()=>{state.theme=state.theme==="dark"?"light":"dark";document.body.classList.toggle("dark",state.theme==="dark");$("themeBtn").textContent=state.theme==="dark"?"☀":"☾";save()};
document.body.classList.toggle("dark",state.theme==="dark");$("themeBtn").textContent=state.theme==="dark"?"☀":"☾";render();