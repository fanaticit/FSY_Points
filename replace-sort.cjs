const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const searchStr = `          <tbody>
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

              // or just use currentTotal directly.
              const currentTotal = dbTotal + pendingTotal;
              const currentDaily = dbDaily + pendingTotal;
              
              const isPendingCashIn = pendingForChild.some(p => p.task_id === 'cash_in');`;

const replaceStr = `          <tbody>
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
            .map(({ child, childHistory, pendingForChild, currentTotal, currentDaily, isPendingCashIn }) => {`;

if (code.includes(searchStr)) {
  code = code.replace(searchStr, replaceStr);
  
  // also need to replace the closing brace of the map
  // the original ends with:
  //               );
  //             })}
  //           </tbody>
  code = code.replace(
    /              \);\n            }\)}\n          <\/tbody>/,
    "              );\n            })}\n          </tbody>"
  );
  
  fs.writeFileSync('src/pages/Home.tsx', code);
  console.log("Success");
} else {
  console.log("Search string not found!");
}
