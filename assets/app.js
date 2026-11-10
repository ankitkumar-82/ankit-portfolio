(() => {
  const cfg = window.PORTFOLIO_CONFIG || {};
  const ready = cfg.SUPABASE_URL?.startsWith("https://") && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_URL.includes("YOUR_");
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const toast = msg => { const el=$("toast"); el.textContent=msg; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"),3000); };
  $("year").textContent = new Date().getFullYear();
  $("menuToggle").addEventListener("click", ()=>$("mainNav").classList.toggle("open"));
  document.querySelectorAll("#mainNav a").forEach(a=>a.addEventListener("click",()=>$("mainNav").classList.remove("open")));
  if (!ready || !window.supabase) { toast("Connect Supabase in assets/config.js to load live portfolio data."); return; }
  const db = window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
  const put = (id, value, fallback="") => { const el=$(id); if(el) el.textContent=value || fallback; };
  const social = (links, target) => {
    $(target).innerHTML = (links||[]).filter(x=>x.url).map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.label||"Link")} ↗</a>`).join("");
  };
  async function load() {
    const [p,s,pr,ex,ed] = await Promise.all([
      db.from("profile").select("*").eq("id",1).maybeSingle(),
      db.from("skills").select("*").order("category").order("name"),
      db.from("projects").select("*").order("created_at",{ascending:false}),
      db.from("experiences").select("*").order("sort_order").order("created_at",{ascending:false}),
      db.from("education").select("*").order("sort_order").order("created_at",{ascending:false})
    ]);
    for (const r of [p,s,pr,ex,ed]) if(r.error) console.warn(r.error.message);
    const profile=p.data||{};
    put("heroName",profile.name,"Ankit Kumar"); put("heroRole",profile.role,"Student · Developer · Curious Learner");
    put("heroIntro",profile.intro,"I enjoy turning ideas into useful digital experiences and learning new technologies.");
    put("aboutText",profile.about,"I believe in learning by building and improving a little every day.");
    put("emailLink",profile.email,"hello@example.com"); $("emailLink").href="mailto:"+(profile.email||"hello@example.com");
    if(profile.photo_url) $("profileImage").src=profile.photo_url;
    social(profile.social_links,"socialLinks"); social(profile.social_links,"contactLinks");
    $("aboutFacts").innerHTML=[["Location",profile.location||"India"],["Focus","Learning & building"],["Mindset","Keep improving"]].map(([a,b])=>`<div class="fact"><span>${esc(a)}</span><b>${esc(b)}</b></div>`).join("");
    $("skillsGrid").innerHTML=(s.data||[]).length?(s.data||[]).map(x=>`<div class="skill-card"><span class="skill-icon">✳</span><div><b>${esc(x.name)}</b><small>${esc(x.category||"Skill")}</small></div></div>`).join(""):'<div class="empty-state">Skills will appear here soon.</div>';
    $("projectsGrid").innerHTML=(pr.data||[]).length?(pr.data||[]).map(x=>`<article class="project-card">${x.image_url?`<img class="project-image" src="${esc(x.image_url)}" alt="" loading="lazy">`:`<div class="project-image project-placeholder"><span>✳</span></div>`}<div class="project-body"><div class="project-meta"><span>PROJECT</span>${x.featured?'<span class="featured">FEATURED</span>':''}</div><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p><div class="tag-list">${(x.tags||[]).map(t=>`<span>${esc(t)}</span>`).join("")}</div>${x.link?`<a class="project-link" href="${esc(x.link)}" target="_blank" rel="noopener noreferrer">View project ↗</a>`:""}</div></article>`).join(""):'<div class="empty-state">Your projects will appear here.</div>';
    $("experienceList").innerHTML=(ex.data||[]).length?(ex.data||[]).map(x=>`<article class="timeline-item"><div class="timeline-marker"></div><div><span class="timeline-period">${esc(x.period||"")}</span><h3>${esc(x.role)}</h3><b>${esc(x.organization||"")}</b><p>${esc(x.description||"")}</p></div></article>`).join(""):'<div class="empty-state">Experience and activities will appear here.</div>';
    $("educationList").innerHTML=(ed.data||[]).length?(ed.data||[]).map(x=>`<article class="education-card"><span class="education-icon">⌂</span><div><span class="timeline-period">${esc(x.period||"")}</span><h3>${esc(x.course)}</h3><b>${esc(x.institution||"")}</b><p>${esc(x.details||"")}</p></div></article>`).join(""):'<div class="empty-state">Education details will appear here.</div>';
  }
  load().catch(e=>{console.error(e);toast("Could not load portfolio data. Check Supabase setup.");});
})();