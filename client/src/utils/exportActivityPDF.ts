import { User, SkillProfile } from '../types';

export function exportActivityPDF(user: User, profile?: SkillProfile | null) {
  const printWindow = window.open('', '_blank', 'width=850,height=1000');
  if (!printWindow) {
    alert('Please allow popups to generate and download your Activity PDF report.');
    return;
  }

  const skillsTeaching = profile?.skillsTeaching || [];
  const skillsLearning = profile?.skillsLearning || [];
  const stats = profile?.stats || {
    skillsTaught: skillsTeaching.length,
    skillsLearned: skillsLearning.length,
    exchangesCompleted: 0,
    projectsCompleted: 0,
    teachingHours: 0,
    learningHours: 0,
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const memberId = user._id ? user._id.slice(-6).toUpperCase() : 'MEMBER';
  const reportId = `SX-REP-${memberId}-${Date.now().toString().slice(-4)}`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>SkillX Activity Report — ${user.displayName} (@${user.username})</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 14mm 16mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        body {
          background: #ffffff;
          color: #111827;
          line-height: 1.45;
          font-size: 13px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 16px;
          border-bottom: 2px solid #D4AF37;
          margin-bottom: 20px;
        }
        .brand-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #92400E;
          background: #FEF3C7;
          padding: 3px 8px;
          border-radius: 4px;
          margin-bottom: 6px;
        }
        .brand-title {
          font-size: 24px;
          font-weight: 900;
          color: #0F172A;
        }
        .brand-title span {
          color: #D4AF37;
        }
        .brand-sub {
          font-size: 11px;
          color: #64748B;
        }
        .meta-box {
          text-align: right;
          font-size: 11px;
          color: #475569;
        }
        .meta-id {
          font-family: monospace;
          font-weight: 700;
          color: #0F172A;
          font-size: 12px;
        }

        /* Profile Banner */
        .profile-card {
          background: #0B0F19;
          color: #ffffff;
          border-radius: 12px;
          padding: 18px 22px;
          margin-bottom: 20px;
          border: 1px solid #D4AF37;
        }
        .profile-name {
          font-size: 20px;
          font-weight: 800;
          color: #ffffff;
        }
        .profile-username {
          color: #D4AF37;
          font-weight: 600;
          font-size: 13px;
        }
        .profile-tagline {
          color: #CBD5E1;
          font-size: 12px;
          margin-top: 4px;
          font-style: italic;
        }
        .profile-meta {
          display: flex;
          gap: 16px;
          margin-top: 10px;
          font-size: 11px;
          color: #94A3B8;
        }

        /* Stats Grid */
        .section-title {
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #0F172A;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 22px;
        }
        .stat-card {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 8px;
          padding: 10px;
          text-align: center;
        }
        .stat-num {
          font-size: 20px;
          font-weight: 800;
          color: #0F172A;
          font-family: monospace;
        }
        .stat-label {
          font-size: 10px;
          color: #64748B;
          font-weight: 600;
          text-transform: uppercase;
        }

        /* Skills Tables */
        .skills-section {
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
          font-size: 12px;
        }
        th {
          background: #F1F5F9;
          text-align: left;
          padding: 8px 12px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #475569;
          border-bottom: 1px solid #CBD5E1;
        }
        td {
          padding: 8px 12px;
          border-bottom: 1px solid #F1F5F9;
          color: #1E293B;
        }
        .badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 4px;
        }
        .badge-verified {
          background: #FEF3C7;
          color: #92400E;
          border: 1px solid #FDE68A;
        }
        .badge-level {
          background: #E2E8F0;
          color: #334155;
        }
        .badge-seeking {
          background: #E0E7FF;
          color: #3730A3;
        }

        /* Verification Guarantee */
        .guarantee {
          background: #FEF9C3;
          border: 1px solid #FDE047;
          border-radius: 8px;
          padding: 12px 16px;
          margin-top: 24px;
          font-size: 11px;
          color: #713F12;
        }
        .guarantee-title {
          font-weight: 800;
          margin-bottom: 2px;
        }

        /* Footer */
        .footer {
          margin-top: 28px;
          padding-top: 12px;
          border-top: 1px solid #E2E8F0;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #94A3B8;
        }

        .no-print {
          background: #0F172A;
          color: #ffffff;
          padding: 12px;
          text-align: center;
          margin-bottom: 20px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .print-btn {
          background: #D4AF37;
          color: #0F172A;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
        }
        @media print {
          .no-print {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print">
        <span>Save or print this SkillX activity summary as a PDF to share with peers.</span>
        <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
      </div>

      <div class="container">
        <!-- Header -->
        <div class="header">
          <div>
            <div class="brand-badge">Official Activity Export</div>
            <div class="brand-title">Skill<span>X</span> Peer Record</div>
            <div class="brand-sub">Zero-AI Human Peer Skill Exchange Platform</div>
          </div>
          <div class="meta-box">
            <div>Report ID: <span class="meta-id">${reportId}</span></div>
            <div>Issued: <strong>${formattedDate}</strong></div>
            <div>Peer ID: <strong>SX-${memberId}</strong></div>
          </div>
        </div>

        <!-- Profile Box -->
        <div class="profile-card">
          <div class="profile-name">${user.displayName}</div>
          <div class="profile-username">@${user.username}</div>
          <div class="profile-tagline">${user.tagline || 'Collaborative Peer & Knowledge Sharer'}</div>
          <div class="profile-meta">
            ${user.location ? `<span>📍 ${user.location}</span>` : ''}
            ${user.languages && user.languages.length ? `<span>🗣️ ${user.languages.join(', ')}</span>` : ''}
            <span>🛡️ Status: Active Verified Member</span>
          </div>
        </div>

        <!-- Metrics Overview -->
        <div class="section-title">Verified Exchange Metrics</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-num">${stats.exchangesCompleted}</div>
            <div class="stat-label">Exchanges Done</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">${stats.skillsTaught}</div>
            <div class="stat-label">Skills Taught</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">${stats.teachingHours}h</div>
            <div class="stat-label">Teaching Hours</div>
          </div>
          <div class="stat-card">
            <div class="stat-num">${stats.projectsCompleted}</div>
            <div class="stat-label">Projects Built</div>
          </div>
        </div>

        <!-- Skills I Teach -->
        <div class="skills-section">
          <div class="section-title">Teaching Skills & Peer Verification</div>
          <table>
            <thead>
              <tr>
                <th>Skill Name</th>
                <th>Category</th>
                <th>Proficiency</th>
                <th>Verification Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                skillsTeaching.length === 0
                  ? '<tr><td colspan="4" style="text-align:center; color:#94A3B8;">No teaching skills recorded yet.</td></tr>'
                  : skillsTeaching
                      .map(
                        (s) => `
                    <tr>
                      <td><strong>${s.name}</strong></td>
                      <td>${s.category || 'General'}</td>
                      <td><span class="badge badge-level">${s.level}</span></td>
                      <td><span class="badge badge-verified">${s.verificationStatus}</span></td>
                    </tr>
                  `
                      )
                      .join('')
              }
            </tbody>
          </table>
        </div>

        <!-- Skills Currently Seeking -->
        <div class="skills-section">
          <div class="section-title">Learning Goals (Seeking in Exchange)</div>
          <table>
            <thead>
              <tr>
                <th>Skill Target</th>
                <th>Target Level</th>
                <th>Priority</th>
                <th>Preferred Format</th>
              </tr>
            </thead>
            <tbody>
              ${
                skillsLearning.length === 0
                  ? '<tr><td colspan="4" style="text-align:center; color:#94A3B8;">No learning goals recorded yet.</td></tr>'
                  : skillsLearning
                      .map(
                        (s) => `
                    <tr>
                      <td><strong>${s.name}</strong></td>
                      <td><span class="badge badge-seeking">Target: ${s.targetLevel}</span></td>
                      <td>${s.priority}</td>
                      <td>${s.preferredFormat?.join(', ') || 'Any'}</td>
                    </tr>
                  `
                      )
                      .join('')
              }
            </tbody>
          </table>
        </div>

        <!-- Platform Guarantee -->
        <div class="guarantee">
          <div class="guarantee-title">Verified Peer-to-Peer Interaction Record</div>
          All exchange hours, collaborative code studios, and skill endorsements on SkillX are confirmed directly by human peer partners without automated quiz certifications or AI agents.
        </div>

        <!-- Footer -->
        <div class="footer">
          <div>SkillX Platform • Verified Peer Record</div>
          <div>Report generated directly from account SX-${memberId}</div>
        </div>
      </div>

      <script>
        window.onload = function() {
          // Allow render before print dialog
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
