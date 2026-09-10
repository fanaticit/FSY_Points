import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { Child, HistoryRecord, Task } from '../types';

const TASKS: Task[] = [
  { id: 'mag', name: 'Bring SoY Magazine', points: 1 },
  { id: 'guide', name: 'Bring SoY Guide', points: 1 },
  { id: 'disrupt', name: 'Disrupting Class', points: -1 },
];

export default function Home() {
  const [children, setChildren] = useState<Child[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  
  const [pendingChanges, setPendingChanges] = useState<{ child_id: string; task_id: string; points: number }[]>([]);
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data: cData } = await supabase.from('fsyp_children').select('*').order('created_at', { ascending: true });
    const { data: hData } = await supabase.from('fsyp_history').select('*');
    if (cData) setChildren(cData);
    if (hData) setHistory(hData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleTaskClick = (childId: string, task: Task | { id: string, points: number }) => {
    // Check if it's a regular task and if it's already in DB for today
    const isRegularTask = task.id !== 'cash_in';
    const dbRecord = isRegularTask 
      ? history.find(h => h.child_id === childId && h.task_id === task.id && h.completed_date === todayStr)
      : null;
    
    if (dbRecord) {
      setPendingDeletions(prev => prev.includes(dbRecord.id) ? prev.filter(id => id !== dbRecord.id) : [...prev, dbRecord.id]);
      return;
    }

    setPendingChanges((prev) => {
      // For cash_in, we allow multiple if they really want, or just one per day?
      // Let's just allow toggling the cash_in for today as well
      const exists = prev.find(p => p.child_id === childId && p.task_id === task.id);
      if (exists) {
        return prev.filter(p => !(p.child_id === childId && p.task_id === task.id));
      } else {
        return [...prev, { child_id: childId, task_id: task.id, points: task.points }];
      }
    });
  };

  const hasChanges = pendingChanges.length > 0 || pendingDeletions.length > 0;

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    
    try {
      if (pendingDeletions.length > 0) {
        const { error } = await supabase.from('fsyp_history').delete().in('id', pendingDeletions);
        if (error) throw error;
      }

      if (pendingChanges.length > 0) {
        const recordsToInsert = pendingChanges.map(change => ({
          child_id: change.child_id,
          task_id: change.task_id,
          points: change.points,
          completed_date: todayStr
        }));
        const { error } = await supabase.from('fsyp_history').insert(recordsToInsert);
        if (error) throw error;
      }

      setPendingChanges([]);
      setPendingDeletions([]);
      await fetchData();
    } catch (err: any) {
      alert('Error saving data: ' + err.message);
    }
    
    setSaving(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: 'var(--header-bg)' }}>Daily Points Board</h2>
        <button 
          onClick={handleSave} 
          disabled={!hasChanges || saving}
          style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: hasChanges ? 'var(--header-bg)' : '#d1d5db',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: hasChanges ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
            boxShadow: hasChanges ? '0 4px 6px -1px rgba(0,0,0,0.2)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          {saving ? 'Saving...' : `Save Changes (${pendingChanges.length + pendingDeletions.length})`}
        </button>
      </div>

      <div className="table-wrapper">
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--card-bg)' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--header-bg)', color: 'white' }}>
              <th style={{ textAlign: 'left' }}>Child</th>
              <th style={{ textAlign: 'center' }}>Daily Total</th>
              <th style={{ textAlign: 'center', minWidth: '160px' }}>Current Total & Goal</th>
              {TASKS.map(t => (
                <th key={t.id} style={{ textAlign: 'center' }}>
                  {t.name} <br/>
                  <small style={{ color: 'var(--accent)', fontWeight: 'normal' }}>
                    {t.points > 0 ? `+${t.points}` : t.points}
                  </small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {children.map(child => {
              const childHistory = history.filter(h => h.child_id === child.id);
              const pendingForChild = pendingChanges.filter(p => p.child_id === child.id);
              
              const dbTotal = childHistory
                .filter(h => !pendingDeletions.includes(h.id))
                .reduce((sum, h) => sum + h.points, 0);
                
              const dbDaily = childHistory
                .filter(h => h.completed_date === todayStr && !pendingDeletions.includes(h.id))
                .reduce((sum, h) => sum + h.points, 0);

              const pendingTotal = pendingForChild.reduce((sum, p) => sum + p.points, 0);
              const currentTotal = dbTotal + pendingTotal;
              const currentDaily = dbDaily + pendingTotal;
              
              const isPendingCashIn = pendingForChild.some(p => p.task_id === 'cash_in');
              
              return { child, childHistory, pendingForChild, currentTotal, currentDaily, isPendingCashIn };
            })
            .sort((a, b) => b.currentTotal - a.currentTotal)
            .map(({ child, childHistory, pendingForChild, currentTotal, currentDaily, isPendingCashIn }) => {
              const eligibleForSweets = (currentTotal + (isPendingCashIn ? 10 : 0)) >= 10;
              const progress = Math.min((currentTotal + (isPendingCashIn ? 10 : 0)) / 10 * 100, 100);

              return (
                <tr key={child.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{child.name}</td>
                  <td style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}>{currentDaily}</td>
                  
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--header-bg)' }}>{currentTotal} <span style={{ fontSize: '1rem', color: '#6b7280' }}>/ 10</span></span>
                      
                      {child.sweets_image_url && (
                        <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                          <img 
                            src={child.sweets_image_url} 
                            alt="Sweets Goal" 
                            onClick={() => {
                              if (eligibleForSweets || isPendingCashIn) {
                                handleTaskClick(child.id, { id: 'cash_in', points: -10 });
                              }
                            }}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              borderRadius: '50%',
                              border: `3px solid ${isPendingCashIn ? 'var(--positive)' : (eligibleForSweets ? 'var(--accent)' : '#e2e8f0')}`, boxShadow: eligibleForSweets ? '0 0 10px rgba(250, 189, 65, 0.6)' : 'none',
                              cursor: (eligibleForSweets || isPendingCashIn) ? 'pointer' : 'default',
                              filter: 'none', opacity: (eligibleForSweets || isPendingCashIn) ? 1 : 0.8,
                              transition: 'all 0.2s',
                              transform: isPendingCashIn ? 'scale(1.1)' : 'scale(1)'
                            }} 
                            title={isPendingCashIn ? "Click to cancel cash-in" : (eligibleForSweets ? "Click to cash in 10 points!" : "Needs 10 points")}
                          />
                          {isPendingCashIn && (
                            <span style={{
                              position: 'absolute',
                              top: '-2px',
                              right: '-2px',
                              width: '12px',
                              height: '12px',
                              backgroundColor: 'var(--positive)',
                              borderRadius: '50%',
                              border: '2px solid white',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }} />
                          )}
                        </div>
                      )}
                    </div>
                    {child.sweets_image_url && !eligibleForSweets && !isPendingCashIn && (
                       <div style={{ width: '100%', height: '4px', backgroundColor: '#e2e8f0', marginTop: '6px', borderRadius: '2px', overflow: 'hidden' }}>
                         <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--accent)' }} />
                       </div>
                    )}
                  </td>

                  {TASKS.map(t => {
                    const dbRecord = childHistory.find(h => h.task_id === t.id && h.completed_date === todayStr);
                    const isPendingDeletion = dbRecord ? pendingDeletions.includes(dbRecord.id) : false;
                    const isPendingAddition = pendingForChild.some(p => p.task_id === t.id);
                    
                    const isCompleted = isPendingAddition || (dbRecord && !isPendingDeletion);

                    let bgColor = '#f8fafc'; 
                    let textColor = '#475569'; 
                    let borderColor = '#cbd5e1';
                    
                    if (isCompleted) {
                      bgColor = t.points > 0 ? 'var(--positive)' : 'var(--negative)';
                      textColor = 'white';
                      borderColor = bgColor;
                    }
                    
                    const isPendingState = isPendingAddition || isPendingDeletion;

                    return (
                      <td key={t.id} style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => handleTaskClick(child.id, t)}
                          style={{ 
                            padding: '0.6rem 1.2rem',
                            backgroundColor: bgColor,
                            color: textColor,
                            border: `2px solid ${borderColor}`,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            opacity: isCompleted && dbRecord && !isPendingDeletion ? 0.7 : 1, 
                            fontWeight: isCompleted ? 'bold' : '600',
                            minWidth: '100px',
                            position: 'relative',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isCompleted ? 'Done' : (t.points > 0 ? '+1 Point' : '-1 Point')}
                          
                          {isPendingState && (
                            <span style={{
                              position: 'absolute',
                              top: '-6px',
                              right: '-6px',
                              width: '12px',
                              height: '12px',
                              backgroundColor: 'var(--accent)',
                              borderRadius: '50%',
                              border: '2px solid white',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }} />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
