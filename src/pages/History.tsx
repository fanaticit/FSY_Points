import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { Child, HistoryRecord, Task } from '../types';
import { Trash2 } from 'lucide-react';

const TASKS: Record<string, string> = {
  'mag': 'Bring SoY Magazine',
  'guide': 'Bring SoY Guide',
  'disrupt': 'Disrupting Class',
};

export default function History() {
  const [history, setHistory] = useState<(HistoryRecord & { child: Child })[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    // Fetch history and child info
    const { data: hData, error: hError } = await supabase
      .from('fsyp_history')
      .select('*, fsyp_children(id, name)')
      .order('created_at', { ascending: false });
      
    if (hData) {
      // Map it to flat structure for easy rendering
      const formatted = hData.map((row: any) => ({
        ...row,
        child: row.fsyp_children
      }));
      setHistory(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    
    const { error } = await supabase.from('fsyp_history').delete().eq('id', id);
    if (error) {
      alert('Error deleting record: ' + error.message);
    } else {
      fetchHistory();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Points History</h2>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
            <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
            <th style={{ padding: '1rem', textAlign: 'left' }}>Child</th>
            <th style={{ padding: '1rem', textAlign: 'left' }}>Task</th>
            <th style={{ padding: '1rem', textAlign: 'center' }}>Points</th>
            <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {history.map(record => (
            <tr key={record.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '1rem' }}>{new Date(record.created_at).toLocaleString()}</td>
              <td style={{ padding: '1rem', fontWeight: 'bold' }}>{record.child?.name || 'Unknown'}</td>
              <td style={{ padding: '1rem' }}>{TASKS[record.task_id] || record.task_id}</td>
              <td style={{ 
                padding: '1rem', 
                textAlign: 'center', 
                color: record.points > 0 ? '#10b981' : '#ef4444',
                fontWeight: 'bold'
              }}>
                {record.points > 0 ? `+${record.points}` : record.points}
              </td>
              <td style={{ padding: '1rem', textAlign: 'center' }}>
                <button onClick={() => handleDelete(record.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
          {history.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                No history records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
