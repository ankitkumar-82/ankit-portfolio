(() => {
  const cfg=window.PORTFOLIO_CONFIG||{}, ready=cfg.SUPABASE_URL?.startsWith("https://")&&cfg.SUPABASE_ANON_KEY&&!cfg.SUPABASE_URL.includes("YOUR_");
  const $=id=>document.getElementById(id), esc=s=>String(s??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const toast=msg=>{const el=$("toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),3200);};
  if(!ready||!window.supabase){$("loginMessage").textContent="First configure Supabase in assets/config.js.";return;}
  const db=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
  let cache={skills:[],projects:[],experiences:[],education:[]};
  const msg=(t)=>{$("dashNotice").textContent=t;$("dashNotice").classList.add("visible");};
  const values=form=>Object.fromEntries(new FormData(form).entries());
  const clean=(obj,keys)=>Object.fromEntries(keys.map(k=>[k,obj[k]??""]));
  const requireAdmin=async()=>{const {data:{session}}=await db.auth.getSession();if(!session)return false;const {data,error}=await db.from("admins").select("user_id").eq("user_id",session.user.id).maybeSingle();if(error||!data)return false;return true;};
  async function showDashboard(){if(!(await requireAdmin()))return false;$("loginPanel").classList.add("hidden");$("dashboard").classList.remove("hidden");await refresh();return true;}
  $("loginForm").addEventListener("submit",async e=>{e.preventDefault();const email=$("loginEmail").value.trim(),password=$("loginPassword").value;const {error}=await db.auth.signInWithPassword({email,password});if(error){$("loginMessage").textContent=error.message;return;}if(!(await showDashboard())){await db.auth.signOut();$("loginMessage").textContent="This account is not authorized as the portfolio admin."; }});
  $("forgotBtn").addEventListener("click",async()=>{const email=$("loginEmail").value.trim();if(!email){$("loginMessage").textContent="Enter your registered admin email first.";return;}const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});$("loginMessage").textContent=error?"Could not send recovery email: "+error.message:"If the address is registered, a password recovery email has been sent.";});
  $("logoutBtn").addEventListener("click",async()=>{await db.auth.signOut();location.reload();});
  $("dashTabs").addEventListener("click",e=>{const b=e.target.closest("button[data-tab]");if(!b)return;document.querySelectorAll(".dash-tabs button").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".tab-panel").forEach(x=>x.classList.toggle("active",x.id==="tab-"+b.dataset.tab));});
  async function refresh(){
    const [p,s,pr,ex,ed]=await Promise.all([db.from("profile").select("*").eq("id",1).maybeSingle(),db.from("skills").select("*").order("created_at",{ascending:false}),db.from("projects").select("*").order("created_at",{ascending:false}),db.from("experiences").select("*").order("created_at",{ascending:false}),db.from("education").select("*").order("created_at",{ascending:false})]);
    for(const r of [p,s,pr,ex,ed])if(r.error)console.warn(r.error.message);
    cache={skills:s.data||[],projects:pr.data||[],experiences:ex.data||[],education:ed.data||[]};
    const f=$("profileForm");const pData=p.data||{name:"Ankit Kumar",role:"Student · Developer · Curious Learner"};["name","role","intro","about","email","location"].forEach(k=>f.elements[k].value=pData[k]||"");
    renderRows("skillRows",cache.skills,x=>`${x.name} · ${x.category||"Skill"}`,"skills");
    renderRows("projectRows",cache.projects,x=>x.title,"projects");
    renderRows("experienceRows",cache.experiences,x=>`${x.role} · ${x.organization||""}`,"experiences");
    renderRows("educationRows",cache.education,x=>`${x.course} · ${x.institution||""}`,"education");
  }
  function renderRows(id,rows,label,table){$(id).innerHTML=rows.length?rows.map(x=>`<div class="manage-row"><span>${esc(label(x))}</span><div><button data-edit="${esc(x.id)}" data-table="${table}">Edit</button><button class="danger" data-delete="${esc(x.id)}" data-table="${table}">Delete</button></div></div>`).join(""):'<p class="muted small">No entries yet.</p>';}
  $("profileForm").addEventListener("submit",async e=>{e.preventDefault();const v=values(e.target);delete v.photoFile;const {error}=await db.from("profile").upsert({id:1,...v,updated_at:new Date().toISOString()});if(error)return toast(error.message);const file=$("photoFile").files[0];if(file){if(file.size>3*1024*1024)return toast("Please choose an image under 3 MB.");if(!["image/jpeg","image/png","image/webp"].includes(file.type))return toast("Use JPG, PNG or WEBP.");const ext=file.name.split(".").pop().toLowerCase(),path=`profile/avatar-${Date.now()}.${ext}`;const up=await db.storage.from("portfolio-media").upload(path,file,{upsert:true,contentType:file.type});if(up.error)return toast(up.error.message);const pub=db.storage.from("portfolio-media").getPublicUrl(path).data.publicUrl;const saved=await db.from("profile").update({photo_url:pub}).eq("id",1);if(saved.error)return toast(saved.error.message);}toast("Profile saved.");await refresh();});
  $("skillForm").addEventListener("submit",async e=>{e.preventDefault();const v=values(e.target);const {error}=await db.from("skills").insert({name:v.name,category:v.category});if(error)return toast(error.message);e.target.reset();toast("Skill added.");refresh();});
  const setupEditor=(formId,table,fields,transform=x=>x)=>$(formId).addEventListener("submit",async e=>{e.preventDefault();const v=values(e.target),id=v.id;delete v.id;const payload=transform(v);const q=id?db.from(table).update(payload).eq("id",id):db.from(table).insert(payload);const {error}=await q;if(error)return toast(error.message);e.target.reset();e.target.elements.id.value="";toast("Saved successfully.");refresh();});
  setupEditor("projectForm","projects",[],v=>({...v,tags:v.tags? v.tags.split(",").map(x=>x.trim()).filter(Boolean):[],featured:v.featured==="on"}));
  setupEditor("experienceForm","experiences");setupEditor("educationForm","education");
  document.querySelector(".dash-content").addEventListener("click",async e=>{
    const del=e.target.closest("[data-delete]");if(del){if(!confirm("Delete this item permanently?"))return;const {error}=await db.from(del.dataset.table).delete().eq("id",del.dataset.delete);if(error)return toast(error.message);toast("Deleted.");refresh();return;}
    const edit=e.target.closest("[data-edit]");if(!edit)return;const row=cache[edit.dataset.table].find(x=>String(x.id)===edit.dataset.edit);if(!row)return;
    const map={projects:["projectForm",["id","title","description","link","image_url"]],experiences:["experienceForm",["id","role","organization","period","description"]],education:["educationForm",["id","course","institution","period","details"]]};
    if(edit.dataset.table==="skills"){const name=prompt("Skill name",row.name);if(name===null)return;const category=prompt("Category",row.category||"");const {error}=await db.from("skills").update({name,category}).eq("id",row.id);if(error)return toast(error.message);refresh();return;}
    const [fid,keys]=map[edit.dataset.table],form=$(fid);keys.forEach(k=>{if(form.elements[k])form.elements[k].value=row[k]??"";});if(edit.dataset.table==="projects"){form.elements.tags.value=(row.tags||[]).join(", ");form.elements.featured.checked=!!row.featured;}document.querySelector(`button[data-tab="${edit.dataset.table==="projects"?"projects":edit.dataset.table}"]`).click();form.scrollIntoView({behavior:"smooth",block:"center"});
  });
  $("passwordForm").addEventListener("submit",async e=>{e.preventDefault();const password=e.target.elements.password.value;const {error}=await db.auth.updateUser({password});if(error)return toast(error.message);e.target.reset();toast("Password updated.");});
  $("emailForm").addEventListener("submit",async e=>{e.preventDefault();const email=e.target.elements.email.value;const {error}=await db.auth.updateUser({email});if(error)return toast(error.message);toast("Check your new email to confirm the change.");});
  db.auth.onAuthStateChange((_event,session)=>{if(!session){$("dashboard").classList.add("hidden");$("loginPanel").classList.remove("hidden");}});
  showDashboard();
})();