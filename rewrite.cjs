const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const regex = /<tbody>([\s\S]*?)<\/tbody>/;
const match = code.match(regex);
if (!match) throw new Error("Could not find tbody");

const newTbody = `<tbody>
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
                  <td style={{ padding: '1.25rem 1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>{child.name}</td>
                  <td style={{ padding: '1.25rem 1rem', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold' }}>{currentDaily}</td>
                  
                  <td style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>
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
                              border: \`3px solid \${isPendingCashIn ? 'var(--positive)' : (eligibleForSweets ? 'var(--accent)' : '#e2e8f0')}\`, boxShadow: eligibleForSweets ? '0 0 10px rgba(250, 189, 65, 0.6)' : 'none',
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
                         <div style={{ width: \`\${progress}%\`, height: '100%', backgroundColor: 'var(--accent)' }} />
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
                      <td key={t.id} style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleTaskClick(child.id, t)}
                          style={{ 
                            padding: '0.6rem 1.2rem',
                            backgroundColor: bgColor,
                            color: textColor,
                            border: \`2px solid \${borderColor}\`,
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
          </tbody>`;

code = code.replace(regex, newTbody);
fs.writeFileSync('src/pages/Home.tsx', code);
