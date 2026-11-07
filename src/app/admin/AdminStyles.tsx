'use client';

export default function AdminStyles() {
  return (
    <style jsx global>{`
      :root {
        --primary: #f6a821;
        --primary-hover: #e09415;
        --dark: #1e293b;
        --light: #f8fafc;
        --gray: #64748b;
        --border: #e2e8f0;
        --danger: #ef4444;
        --success: #10b981;
      }
      * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Poppins', sans-serif; }
      body { background-color: var(--light); color: var(--dark); }
      a { text-decoration: none; color: inherit; }
      ul { list-style: none; }
      .admin-wrapper { display: flex; min-height: 100vh; width: 100%; }
      .sidebar { width: 260px; background-color: var(--dark); color: #fff; display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; }
      .logo { padding: 25px; font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); }
      .logo i { color: var(--primary); }
      .nav-links { padding: 20px 0; flex: 1; }
      .nav-links li a { display: flex; align-items: center; gap: 15px; padding: 15px 25px; font-size: 15px; color: #cbd5e1; transition: 0.2s; cursor: pointer; }
      .nav-links li a:hover, .nav-links li a.active { background-color: rgba(255,255,255,0.05); color: var(--primary); border-left: 4px solid var(--primary); }
      .sidebar-footer { padding: 20px; border-top: 1px solid rgba(255,255,255,0.1); }
      .sidebar-footer a { display: flex; align-items: center; gap: 10px; color: #cbd5e1; cursor: pointer;}
      .sidebar-footer a:hover { color: var(--danger); }
      .main-content { flex: 1; display: flex; flex-direction: column; overflow-y: auto; min-width: 0; }
      .topbar { background: #fff; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 10; }
      .topbar h2 { font-size: 20px; font-weight: 600; }
      .user-info { display: flex; align-items: center; gap: 15px; }
      .user-info img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
      .page-container { padding: 30px; animation: fadeIn 0.3s ease; }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
      .btn { padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; font-weight: 500; transition: 0.2s; display: inline-flex; align-items: center; gap: 8px; font-size: 14px; }
      .btn-primary { background: var(--primary); color: #fff; }
      .btn-primary:hover { background: var(--primary-hover); }
      .btn-danger { background: var(--danger); color: #fff; }
      .btn-danger:hover { background: #dc2626; }
      .btn-secondary { background: #e2e8f0; color: var(--dark); }
      .btn-sm { padding: 8px 15px; border-radius: 8px; border: none; cursor: pointer; font-weight: 500; font-size: 13px; }
      .btn-add { background: var(--dark); color: #fff; }
      .table-container { background: #fff; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; }
      table { width: 100%; border-collapse: collapse; text-align: left; }
      th { background: #f8fafc; padding: 15px 20px; font-size: 13px; text-transform: uppercase; color: var(--gray); font-weight: 600; border-bottom: 1px solid var(--border); }
      td { padding: 15px 20px; border-bottom: 1px solid var(--border); font-size: 14px; vertical-align: middle;}
      tr:last-child td { border-bottom: none; }
      tr:hover { background: #f8fafc; }
      .badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
      .badge-active { background: #d1fae5; color: var(--success); }
      .badge-inactive { background: #fee2e2; color: var(--danger); }
      .action-btns { display: flex; gap: 8px; }
      .icon-btn { width: 30px; height: 30px; border-radius: 6px; border: none; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: 0.2s; }
      .btn-edit { background: #e0f2fe; color: #0284c7; }
      .btn-edit:hover { background: #bae6fd; }
      .btn-delete-icon { background: #fee2e2; color: var(--danger); }
      .btn-delete-icon:hover { background: #fecaca; }
      .form-card { background: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); max-width: 800px; }
      .form-section { background: #fff; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); padding: 25px; margin-bottom: 25px; border: 1px solid var(--border); }
      .section-title { font-size: 18px; font-weight: 600; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
      .section-title i { color: var(--primary); }
      .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
      .form-row.three-col { grid-template-columns: 1fr 1fr 1fr; }
      .form-group { margin-bottom: 0; }
      .form-group label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 8px; color: var(--dark); }
      .form-group input[type="text"], .form-group input[type="number"], .form-group input[type="email"], .form-group input[type="password"], .form-group select, .form-group textarea {
        width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px; outline: none; font-size: 14px; font-family: 'Poppins', sans-serif; background: #fafafa; transition: 0.2s;
      }
      .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--primary); background: #fff; }
      .form-group textarea { resize: vertical; min-height: 100px; }
      .help-text { font-size: 11px; color: var(--gray); margin-top: 5px; display: block; }
      .image-upload-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; grid-template-rows: 120px 120px; gap: 15px; margin-bottom: 10px; }
      .upload-box { border: 2px dashed var(--border); border-radius: 10px; display: flex; flex-direction: column; justify-content: center; align-items: center; color: var(--gray); cursor: pointer; background: #fafafa; transition: 0.2s; position: relative; overflow: hidden;}
      .upload-box:hover { border-color: var(--primary); color: var(--primary); background: #fff8eb; }
      .upload-box.main-img { grid-row: 1 / 3; }
      .upload-box i { font-size: 24px; margin-bottom: 5px; }
      .upload-box span { font-size: 12px; font-weight: 500; }
      .features-list { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px; }
      .feature-item { background: #f1f5f9; padding: 8px 15px; border-radius: 20px; font-size: 13px; display: flex; align-items: center; gap: 8px; }
      .feature-item i { cursor: pointer; color: var(--gray); transition: 0.2s; }
      .feature-item i:hover { color: var(--danger); }
      .add-feature-input { display: flex; gap: 10px; max-width: 400px; }
      .itinerary-builder { display: flex; flex-direction: column; gap: 15px; }
      .itinerary-row { display: flex; gap: 15px; align-items: flex-start; background: #fafafa; padding: 15px; border-radius: 10px; border: 1px solid var(--border); }
      .itinerary-row .number { background: var(--primary); color: #fff; width: 30px; height: 30px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: 600; flex-shrink: 0; }
      .itinerary-row .fields { flex: 1; display: flex; flex-direction: column; gap: 10px; }
      .itinerary-row .fields input, .itinerary-row .fields textarea { padding: 8px; font-size: 13px; }
      .btn-remove { background: #fee2e2; color: var(--danger); padding: 8px 12px; border-radius: 8px; border: none; cursor: pointer; align-self: flex-start; }
      .submit-bar { display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; padding-bottom: 50px; }
      .btn-cancel { background: #e2e8f0; color: var(--dark); padding: 12px 25px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; }
      .btn-save { background: var(--primary); color: #fff; padding: 12px 30px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; box-shadow: 0 4px 10px rgba(246, 168, 33, 0.3); }
      .btn-save:hover { background: var(--primary-hover); }
      .profile-header { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
      .profile-avatar { width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary); }
      .avatar-upload { position: relative; }
      .avatar-upload input { position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer; top: 0; left: 0; }
      .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
      .modal { background: #fff; width: 500px; border-radius: 12px; padding: 25px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); animation: fadeIn 0.3s ease; }
      .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
      .modal-header h3 { font-size: 18px; }
      .close-modal { cursor: pointer; background: none; border: none; font-size: 20px; color: var(--gray); }
      .modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; }

      /* CMS submenu */
      .nav-group-toggle { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 15px; padding: 15px 25px; font-size: 15px; color: #cbd5e1; background: transparent; border: 0; cursor: pointer; text-align: left; font-family: inherit; }
      .nav-group-toggle span { display: flex; align-items: center; gap: 15px; }
      .nav-group-toggle:hover, .nav-group-toggle.active { background-color: rgba(255,255,255,0.05); color: var(--primary); border-left: 4px solid var(--primary); }
      .nav-chevron { font-size: 11px; opacity: .8; }
      .sub-nav-links { list-style: none; padding: 0 0 8px; margin: 0; }
      .sub-nav-links li a { padding: 11px 25px 11px 52px; font-size: 14px; }
      .sub-nav-links li a:hover, .sub-nav-links li a.active { border-left: 4px solid transparent; }
      .cms-hero-grid { display: grid; gap: 16px; }
      .cms-slide-card { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: grid; grid-template-columns: 220px 1fr auto; gap: 16px; align-items: start; }
      .cms-slide-preview { width: 220px; height: 124px; border-radius: 10px; overflow: hidden; background: #e2e8f0; display:flex; align-items:center; justify-content:center; color:#94a3b8; }
      .cms-slide-preview img { width:100%; height:100%; object-fit:cover; display:block; }
      .cms-slide-actions { display:flex; flex-direction:column; gap:8px; }
      @media (max-width: 900px) { .cms-slide-card { grid-template-columns: 1fr; } .cms-slide-preview { width:100%; height:180px; } .cms-slide-actions { flex-direction:row; flex-wrap:wrap; } }
    `}</style>
  );
}

