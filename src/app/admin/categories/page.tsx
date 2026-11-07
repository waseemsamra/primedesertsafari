'use client';

import { useState } from 'react';
import Topbar from '@/components/admin/Topbar';

interface Category {
  id: number;
  name: string;
}

interface Tour {
  id: number;
  name: string;
  category: string;
  price: number;
  status: 'Active' | 'Inactive';
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: 'Desert Safaris' },
    { id: 2, name: 'City Tours' },
    { id: 3, name: 'Water Parks' }
  ]);

  const [tours, setTours] = useState<Tour[]>([
    { id: 1, name: 'Evening Desert Safari', category: 'Desert Safaris', price: 140, status: 'Active' },
    { id: 2, name: 'Dubai Full Day Tour', category: 'City Tours', price: 200, status: 'Active' },
    { id: 3, name: 'Aquaventure Waterpark', category: 'Water Parks', price: 299, status: 'Inactive' }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  const openCategoryModal = () => {
    setEditingCategory(null);
    setFormData({ name: '' });
    setShowModal(true);
  };

  const editCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setShowModal(true);
  };

  const deleteCategory = (id: number) => {
    if (confirm('Are you sure you want to delete this category? Tours in this category will remain but may lose their category link.')) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      const oldName = editingCategory.name;
      setCategories(categories.map(c => 
        c.id === editingCategory.id ? { ...c, name: formData.name } : c
      ));
      setTours(tours.map(t => 
        t.category === oldName ? { ...t, category: formData.name } : t
      ));
    } else {
      const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
      setCategories([...categories, { id: newId, name: formData.name }]);
    }
    
    setShowModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <Topbar title="Manage Categories" />
      <div className="page-container">
        <div className="header-actions">
          <p style={{ color: 'var(--gray)', fontSize: '14px' }}>
            Manage tour categories (e.g., Desert Safaris, City Tours).
          </p>
          <button className="btn btn-primary" onClick={openCategoryModal}>
            <i className="fas fa-plus"></i> Add Category
          </button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Total Tours</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const tourCount = tours.filter(t => t.category === cat.name).length;
                return (
                  <tr key={cat.id}>
                    <td><strong>{cat.name}</strong></td>
                    <td>{tourCount} Tours</td>
                    <td className="action-btns">
                      <button className="icon-btn btn-edit" onClick={() => editCategory(cat)}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="icon-btn btn-delete" onClick={() => deleteCategory(cat.id)}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
              <button className="close-modal" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  required 
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
