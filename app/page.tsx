"use client";

import { useEffect, useState } from "react";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

type Proposal = { id:string; club_id:string; title:string; description:string|null; venue:string; starts_at:string; ends_at:string; status:string; submitted_by:string };
type Club = { id:string; name:string };
type Membership = { club_id:string };
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const client: SupabaseClient | null = url && key ? createClient(url,key) : null;
const timezone = "Asia/Kuala_Lumpur";
const dateLabel = (s:string) => new Intl.DateTimeFormat("en-MY",{dateStyle:"medium",timeStyle:"short",timeZone:timezone}).format(new Date(s));
function googleLink(p:Proposal) {
  const fmt=(s:string)=>new Date(s).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");
  const q=new URLSearchParams({action:"TEMPLATE",text:p.title,dates:fmt(p.starts_at)+"/"+fmt(p.ends_at),details:p.description||"",location:p.venue,ctz:timezone});
  return "https://calendar.google.com/calendar/render?"+q.toString();
}
export default function Home(){
  const [user,setUser]=useState<User|null>(null);
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [clubs,setClubs]=useState<Club[]>([]);
  const [membership,setMembership]=useState<Membership[]>([]);
  const [src,setSrc]=useState(false);
  const [proposals,setProposals]=useState<Proposal[]>([]);
  const [registered,setRegistered]=useState<string[]>([]);
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  const [title,setTitle]=useState("");
  const [description,setDescription]=useState("");
  const [venue,setVenue]=useState("");
  const [clubId,setClubId]=useState("");
  const [starts,setStarts]=useState("");
  const [ends,setEnds]=useState("");
  const [reason,setReason]=useState("");
  async function refresh(u:User|null) {
    if(!client||!u){setClubs([]);setMembership([]);setSrc(false);setProposals([]);setRegistered([]);return;}
    const [c,m,s,p,r]=await Promise.all([
      client.from("clubs").select("id,name").order("name"),
      client.from("cmc_club_memberships").select("club_id").eq("user_id",u.id),
      client.from("cmc_src_memberships").select("active").eq("user_id",u.id).maybeSingle(),
      client.from("cmc_event_proposals").select("*").order("starts_at",{ascending:true}),
      client.from("cmc_registrations").select("proposal_id").eq("user_id",u.id)
    ]);
    for(const result of [c,m,s,p,r]) if(result.error) setMessage(result.error.message);
    setClubs((c.data||[]) as Club[]);
    setMembership((m.data||[]) as Membership[]);
    setSrc(s.data?.active===true);
    setProposals((p.data||[]) as Proposal[]);
    setRegistered((r.data||[]).map(x=>x.proposal_id));
  }
  useEffect(()=>{
    if(!client)return;
    const db=client;
    db.auth.getUser().then(({data})=>{setUser(data.user);void refresh(data.user);});
    const {data:{subscription}}=db.auth.onAuthStateChange((_event,session)=>{
      setUser(session?.user||null);
      // Defer queries until the auth state callback completes.
      setTimeout(()=>void refresh(session?.user||null),0);
    });
    return ()=>subscription.unsubscribe();
  },[]);
  async function signIn(e:React.FormEvent){
    e.preventDefault();if(!client)return;
    setBusy(true);setMessage("");
    const {error}=await client.auth.signInWithPassword({email,password});
    if(error)setMessage(error.message);
    setBusy(false);
  }
  async function signUp(){
    if(!client)return;
    setBusy(true);const {error}=await client.auth.signUp({email,password});
    setMessage(error?.message||"Check your email to confirm your account, if confirmation is enabled.");
    setBusy(false);
  }
  async function createProposal(e:React.FormEvent){
    e.preventDefault();if(!client||!user)return;
    if(!clubId||!starts||!ends||new Date(ends)<=new Date(starts)){setMessage("Choose a club and valid start/end times.");return;}
    setBusy(true);
    const {data,error}=await client.from("cmc_event_proposals").insert({
      club_id:clubId,submitted_by:user.id,title,description,venue,
      starts_at:new Date(starts).toISOString(),ends_at:new Date(ends).toISOString(),status:"draft"
    }).select("id").single();
    if(error)setMessage(error.message);
    else {
      const result=await client.rpc("cmc_submit_proposal",{p_id:data.id});
      setMessage(result.error?.message||"Proposal submitted for SRC approval.");
      if(!result.error){setTitle("");setDescription("");setVenue("");setStarts("");setEnds("");}
      await refresh(user);
    }
    setBusy(false);
  }
  async function review(p:Proposal,decision:string){
    if(!client||!user)return;
    if(decision!=="approved"&&!reason.trim()){setMessage("Enter a reason for rejection or requested changes.");return;}
    setBusy(true);
    const {error}=await client.rpc("cmc_review_proposal",{p_id:p.id,p_decision:decision,p_reason:reason||null});
    setMessage(error?.message||"SRC decision recorded.");
    if(!error){setReason("");await refresh(user);}
    setBusy(false);
  }
  async function register(p:Proposal){
    if(!client||!user)return;setBusy(true);
    const {error}=registered.includes(p.id)
      ?await client.from("cmc_registrations").delete().eq("proposal_id",p.id).eq("user_id",user.id)
      :await client.from("cmc_registrations").insert({proposal_id:p.id,user_id:user.id});
    setMessage(error?.message||(registered.includes(p.id)?"Registration cancelled. Remove any manually saved calendar entry.":"Registration confirmed. You can add the event to Google Calendar."));
    await refresh(user);setBusy(false);
  }
  if(!client)return <main><h1>UNITEN Club Master Calendar</h1><div className="panel">Configuration required: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in Vercel.</div></main>;
  const approved=proposals.filter(p=>p.status==="approved");
  const mine=proposals.filter(p=>membership.some(m=>m.club_id===p.club_id));
  const pending=proposals.filter(p=>p.status==="pending_src_review");
  return <main>
    <header><strong>UNITEN · Club Master Calendar</strong><span className="tag">Malaysia time · MYT</span></header>
    <h1>One university. One coordinated calendar.</h1>
    <p>Every club event requires Student Representative Council approval before appearing on the calendar.</p>
    {!user?<section className="panel"><h2>Student sign in</h2><form onSubmit={signIn} className="stack">
      <label>Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
      <label>Password<input required minLength={6} type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
      <div className="actions"><button disabled={busy}>Sign in</button><button type="button" disabled={busy} className="secondary" onClick={signUp}>Create account</button></div>
    </form><p>New accounts start as students. Club representative and SRC access must be assigned by an authorised administrator.</p></section>:
    <>
      <div className="actions"><span>Signed in as <strong>{user.email}</strong></span><button className="secondary" onClick={()=>void client.auth.signOut()}>Sign out</button><button className="secondary" onClick={()=>void refresh(user)}>Refresh</button></div>
      <section className="panel"><h2>Approved events</h2>
        {approved.length===0?<p>No approved events are available yet.</p>:<div className="grid">{approved.map(p=><article className="tile" key={p.id}>
          <h3>{p.title}</h3><p>{p.description}</p><p><strong>{dateLabel(p.starts_at)}</strong> – {dateLabel(p.ends_at)}</p><p>Venue: {p.venue}</p>
          <div className="actions"><button disabled={busy} onClick={()=>void register(p)}>{registered.includes(p.id)?"Cancel registration":"Register"}</button>
          {registered.includes(p.id)&&<a href={googleLink(p)} target="_blank" rel="noopener noreferrer">Add to Google Calendar</a>}</div>
        </article>)}</div>}
        <p><small>Google Calendar opens a manual event template. Automatic sync and 7-day, 24-hour and 1-hour reminders require a later OAuth integration; configure reminders manually until then.</small></p>
      </section>
      {membership.length>0&&<section className="panel"><h2>Submit a club event</h2>
        <form className="stack" onSubmit={createProposal}>
          <label>Club<select required value={clubId} onChange={e=>setClubId(e.target.value)}><option value="">Select your club</option>{clubs.filter(c=>membership.some(m=>m.club_id===c.id)).map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
          <label>Event title<input required minLength={3} maxLength={200} value={title} onChange={e=>setTitle(e.target.value)}/></label>
          <label>Description<textarea value={description} onChange={e=>setDescription(e.target.value)}/></label>
          <label>Venue<input required value={venue} onChange={e=>setVenue(e.target.value)}/></label>
          <label>Start (Malaysia time)<input required type="datetime-local" value={starts} onChange={e=>setStarts(e.target.value)}/></label>
          <label>End (Malaysia time)<input required type="datetime-local" value={ends} onChange={e=>setEnds(e.target.value)}/></label>
          <button disabled={busy}>Submit for SRC approval</button>
        </form><h3>Your club proposals</h3>
        {mine.length===0?<p>No proposals yet.</p>:mine.map(p=><p key={p.id}><strong>{p.title}</strong> — {p.status} · {dateLabel(p.starts_at)}</p>)}
      </section>}
      {src&&<section className="panel"><h2>SRC approval dashboard</h2>
        <p>Only active SRC officers may record decisions. Approvals are checked again in the database.</p>
        <label>Reason for rejection / revision request<textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Required unless approving"/></label>
        {pending.length===0?<p>No pending proposals.</p>:pending.map(p=><article className="tile" key={p.id}>
          <h3>{p.title}</h3><p>{p.description}</p><p>{dateLabel(p.starts_at)} – {dateLabel(p.ends_at)} · {p.venue}</p>
          <div className="actions"><button disabled={busy} onClick={()=>void review(p,"approved")}>Approve</button>
          <button disabled={busy} className="secondary" onClick={()=>void review(p,"changes_requested")}>Request changes</button>
          <button disabled={busy} className="secondary" onClick={()=>void review(p,"rejected")}>Reject</button></div>
        </article>)}
      </section>}
    </>}
    {message&&<div className="notice" role="status">{message}</div>}
  </main>;
}
