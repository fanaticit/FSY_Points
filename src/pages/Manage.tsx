import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { Child } from '../types';
import { Trash2, Upload } from 'lucide-react';

export default function Manage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const fetchChildren = async () => {
    setLoading(true);
    const { data } = await supabase.from('fsyp_children').select('*').order('created_at', { ascending: true });
    if (data) setChildren(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    const { error } = await supabase.from('fsyp_children').insert([{ name: newName.trim() }]);
    if (error) {
      alert('Error adding child: ' + error.message);
    } else {
      setNewName('');
      fetchChildren();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this child? All their history will be lost.')) return;
    
    const { error } = await supabase.from('fsyp_children').delete().eq('id', id);
    if (error) {
      alert('Error deleting child: ' + error.message);
    } else {
      fetchChildren();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, child: Child) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${child.id}-${Date.now()}.${fileExt}`;
    
    setUploadingId(child.id);

    try {
      // 1. Upload the image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('sweets')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      // 2. Get the public URL for the newly uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('sweets')
        .getPublicUrl(fileName);

      // 3. Update the child record with the new URL
      const { error: updateError } = await supabase.from('fsyp_children').update({ sweets_image_url: publicUrl }).eq('id', child.id);
      
      if (updateError) throw updateError;
      
      await fetchChildren();
    } catch (error: any) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--header-bg)', marginBottom: '1.5rem' }}>Manage Children</h2>
      
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
        <input 
          type="text" 
          value={newName} 
          onChange={(e) => setNewName(e.target.value)} 
          placeholder="New child name"
          style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '1rem' }}
        />
        <button type="submit" style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--header-bg)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Add Child
        </button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0, backgroundColor: 'var(--card-bg)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', margin: 0 }}>
        {children.map(child => (
          <li key={child.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem', minWidth: '100px' }}>{child.name}</span>
            
            <div style={{ display: 'flex', flex: 1, gap: '1rem', alignItems: 'center', minWidth: '300px' }}>
              {child.sweets_image_url ? (
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border)', flexShrink: 0 }}>
                  <img src={child.sweets_image_url} alt="Sweets" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f3f4f6', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>No img</span>
                </div>
              )}
              
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  padding: '0.5rem 1rem', 
                  backgroundColor: '#f3f4f6', 
                  border: '1px solid var(--border)', 
                  borderRadius: '6px', 
                  cursor: uploadingId === child.id ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: 'var(--header-bg)',
                  transition: 'background-color 0.2s'
                }}>
                  <Upload size={16} />
                  {uploadingId === child.id ? 'Uploading...' : 'Upload Sweets Image'}
                  <input 
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    disabled={uploadingId === child.id}
                    onChange={(e) => handleFileUpload(e, child)}
                  />
                </label>
              </div>
            </div>

            <button onClick={() => handleDelete(child.id)} style={{ color: 'var(--negative)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
              <Trash2 size={20} />
            </button>
          </li>
        ))}
        {children.length === 0 && <li style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No children added yet.</li>}
      </ul>
    </div>
  );
}
