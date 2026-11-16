export default function Home() {
  return <main>
    <header><strong>UNITEN · Club Master Calendar</strong><span className="tag">Foundation preview</span></header>
    <h1>One university. One coordinated calendar.</h1>
    <p>Plan club activities, reduce scheduling clashes and make it easier for students to participate.</p>
    <section className="panel">
      <h2>How it will work</h2>
      <div className="grid">
        <div className="tile"><strong>1. Club proposal</strong><p>Club representatives submit their preferred date, time and venue.</p></div>
        <div className="tile"><strong>2. SRC approval</strong><p>Every event must be reviewed and approved by SRC before publication.</p></div>
        <div className="tile"><strong>3. Student registration</strong><p>Students discover approved events and register when places are available.</p></div>
        <div className="tile"><strong>4. Calendar reminders</strong><p>Opt-in Google Calendar reminders: 7 days, 24 hours and 1 hour before.</p></div>
      </div>
    </section>
    <section className="panel"><h2>Development status</h2><p>This is an informational application scaffold, not a working registration or approval system. Authentication, secure database policies, approval actions and Google Calendar synchronisation are upcoming milestones.</p><small>No live events or student data are displayed.</small></section>
  </main>;
}
