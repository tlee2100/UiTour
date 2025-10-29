import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import './ProfileMenu.css';

// Accessible dropdown menu shown under the profile/hamburger button
const ProfileMenu = forwardRef(function ProfileMenu({ onClose }, ref) {
  return (
    <div ref={ref} className="profile-menu" role="menu" aria-label="User menu">
      <div className="profile-menu_section">
        <button className="profile-menu_item" onClick={onClose} role="menuitem">
          <Icon icon="mdi:help-circle-outline" width="20" height="20" />
          <span>Trung tâm trợ giúp</span>
        </button>
      </div>
      <div className="profile-menu_divider" />
      <div className="profile-menu_item-large" role="menuitem">
        <div className="profile-menu_item-large_text">
          <div className="title">Trở thành host</div>
          <div className="subtitle">Bắt đầu đón tiếp khách và kiếm thêm thu nhập thật dễ dàng.</div>
        </div>
        <div className="profile-menu_item-large_illustration" aria-hidden>
          <Icon icon="mdi:account-tie" width="36" height="36" />
        </div>
      </div>
      <div className="profile-menu_section">
        <button className="profile-menu_item" onClick={onClose} role="menuitem">
          <span>Giới thiệu host</span>
        </button>
        <button className="profile-menu_item" onClick={onClose} role="menuitem">
          <span>Tìm host hỗ trợ</span>
        </button>
      </div>
      <div className="profile-menu_divider" />
      <div className="profile-menu_section">
        <Link className="profile-menu_item" to="/login" role="menuitem" onClick={onClose}>
          <span>Đăng nhập</span>
        </Link>
        <Link className="profile-menu_item" to="/signup" role="menuitem" onClick={onClose}>
          <span>Đăng ký</span>
        </Link>
      </div>
    </div>
  );
});

export default ProfileMenu;


