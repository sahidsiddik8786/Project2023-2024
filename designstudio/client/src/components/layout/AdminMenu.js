import React from "react";
import { NavLink } from "react-router-dom";
import "./HeaderFooter.css";

const AdminMenu = () => {
  return (
    <div className="admin-menu">
      <div className="admin-menu-header">
        <h4>Admin Panel</h4>
      </div>
      <div className="list-group dashboard-menu">
        <NavLink to="/Dashboard/AdminDashboard" className="list-group-item list-group-item-action">
          Dashboard
        </NavLink>
        <NavLink to="/Dashboard/AdminDashboard/create-category" className="list-group-item list-group-item-action">
          Create Category
        </NavLink>
        <NavLink to="/Dashboard/AdminDashboard/create-subcategory" className="list-group-item list-group-item-action">
          Create SubCategory
        </NavLink>
        <NavLink to="/Dashboard/AdminDashboard/create-product" className="list-group-item list-group-item-action">
          Create Product
        </NavLink>
        <NavLink to="/Dashboard/AdminDashboard/products" className="list-group-item list-group-item-action">
          Product
        </NavLink>
        <NavLink to="/Dashboard/admin/orders" className="list-group-item list-group-item-action">
         Orders
        </NavLink>
        <NavLink to="/Dashboard/AdminDashboard/Users" className="list-group-item list-group-item-action">
          Users
        </NavLink>
      </div>
    </div>
  );
};

export default AdminMenu;
