const fs = require('fs');
let c = fs.readFileSync('src/pages/ExplorePage.jsx', 'utf8');

c = c.replace(/className="exp-card opp-card"/g, 'className="explore-card opp-card" style={{borderLeft:"4px solid #f472b6"}}')
    .replace(/className="exp-card-header"/g, 'className="card-header"')
    .replace(/className="exp-identity"/g, 'className="card-identity"')
    .replace(/className="exp-avatar opp-avatar">🎓/g, 'className="athlete-avatar opp-avatar" style={{background:"rgba(244,114,182,0.1)",color:"#f472b6"}}>📢')
    .replace(/className="exp-author"/g, 'className="athlete-meta"')
    .replace(/className="exp-name"/g, 'className="athlete-name"')
    .replace(/className="exp-role"/g, 'className="athlete-location"')
    .replace(/className="exp-header-right"/g, 'className="card-right"')
    .replace(/className="exp-badge">New/g, 'className="sport-badge" style={{color:"#f472b6",borderColor:"rgba(244,114,182,0.3)"}}>New')
    .replace(/className="exp-time"/g, 'className="card-time"')
    .replace(/className="exp-badge">\{opp\.sport\}/g, 'className="role-tag" style={{color:"#00e5a0",borderColor:"rgba(0,229,160,0.3)"}}>{opp.sport}')
    .replace(/className="exp-badge">\{opp\.role\}/g, 'className="role-tag" style={{color:"#38bdf8",borderColor:"rgba(56,189,248,0.3)"}}>{opp.role}')
    .replace(/className="exp-badge">🗓️ \{opp\.date\}/g, 'className="role-tag muted" style={{border:"none",background:"transparent",padding:0}}>🗓️ {opp.date}')
    .replace(/<div className="opp-body" style=\{\{ padding: '4px 20px' \}\}>/g, '<div className="opp-body" style={{ padding: "8px 0px 4px" }}>')
    .replace(/<h3 style=\{\{ margin: '0 0 8px', fontSize: '18px', color: '#fff' \}\}>/g, '<h3 style={{ margin: "0 0 10px", fontSize: "18px", color: "#f1f5f9" }}>')
    .replace(/<p style=\{\{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1\.6' \}\}>/g, '<p className="card-narrative" style={{ borderLeftColor: "#f472b6", fontSize: "13px", margin: 0 }}>')
    .replace(/className="exp-card-footer" style=\{\{ borderTop: '1px solid rgba\(255,255,255,0\.05\)', paddingTop: '16px' \}\}/g, 'style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "16px", display: "flex" }}')
    .replace(/className="exp-scout-btn"/g, '')
    .replace(/style=\{\{ background: applied \? 'rgba\(0,229,160,0\.1\)' : '#f472b6', color: applied \? '#00e5a0' : '#111827' \}\}/g, 'style={{ background: applied ? "rgba(0,229,160,0.1)" : "#f472b6", color: applied ? "#00e5a0" : "#111827", border: applied ? "1px solid rgba(0,229,160,0.3)" : "none", padding: "10px 18px", borderRadius: "12px", fontWeight: "800", cursor: "pointer", fontSize: "13px", width: "100%", transition: "all 0.2s ease" }}')
    .replace(/\{applied \? '✓ Application Sent' : 'Raise Hand \(Apply\)'\}/g, '{applied ? "✓ Trial Request Sent" : "Raise Hand (Apply for Trial)"}');

fs.writeFileSync('src/pages/ExplorePage.jsx', c);
console.log('Fixed CSS classes in ExplorePage.jsx');
