// js/admin-logic.js

auth.onAuthStateChanged((user) => {
    const adminNotLoggedHeader = document.getElementById("admin-not-logged-in");
    const adminContentApprovedBlock = document.getElementById("admin-content-approved");

    if (user) {
        db.collection("users").doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    const userRole = String(userData.role || '').trim().toLowerCase();
                    const userStatus = String(userData.status || '').trim().toLowerCase();

                    if (userRole === 'admin' && userStatus === 'approved') {
                        if (adminNotLoggedHeader) adminNotLoggedHeader.style.display = "none";
                        if (adminContentApprovedBlock) adminContentApprovedBlock.style.display = "block";
                        
                        fetchPendingRegistrations();
                        fetchAllUsers();
                    } else {
                        if (adminNotLoggedHeader) {
                            adminNotLoggedHeader.innerHTML = `
                                <h2 style="color: #ff4d4d;">⚠️ 權限不足</h2>
                                <p>您的帳號需要 <code>role: "admin"</code> 與 <code>status: "approved"</code> 才能開啟後台。</p>
                            `;
                            adminNotLoggedHeader.style.display = "block";
                        }
                        if (adminContentApprovedBlock) adminContentApprovedBlock.style.display = "none";
                    }
                } else {
                    alert(`找不到此 UID (${user.uid}) 的使用者紀錄！`);
                }
            })
            .catch((error) => { 
                console.error("讀取 Firestore 失敗：", error); 
            });
    } else {
        if (adminNotLoggedHeader) adminNotLoggedHeader.style.display = "block";
        if (adminContentApprovedBlock) adminContentApprovedBlock.style.display = "none";
    }
});

// 抓取待審核名單
function fetchPendingRegistrations() {
    const pendingList = document.getElementById("pending-users-list");
    if (!pendingList) return;

    db.collection("users").where("status", "==", "pending").get()
        .then((querySnapshot) => {
            pendingList.innerHTML = "";
            if (querySnapshot.empty) {
                pendingList.innerHTML = "<li style='color: #aaa; padding: 10px;'>目前沒有待審核的新申請。</li>";
                return;
            }

            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                const userId = doc.id;
                const userName = userData.robloxId || userData.uid;

                pendingList.innerHTML += `
                    <li style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid rgba(212,175,55,0.2);">
                        <span><strong>Roblox ID:</strong> <a href="profile.html?uid=${userId}" style="color: var(--text-gold, #d4af37); text-decoration: underline;">${userName}</a></span>
                        <div>
                            <button onclick="approveUser('${userId}', '${userName}')" style="margin-right: 8px; background: #28a745; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">核准</button>
                            <button onclick="rejectUser('${userId}', '${userName}')" style="background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">拒絕</button>
                        </div>
                    </li>
                `;
            });
        })
        .catch((error) => { 
            console.error("抓取待審核名單失敗：", error); 
        });
}

// 抓取所有帳號列表（管理員置頂 + A-Z 排序 + 可點擊進個人檔案）
function fetchAllUsers() {
    const tableBody = document.getElementById("all-users-table-body");
    if (!tableBody) return;

    db.collection("users").get()
        .then((querySnapshot) => {
            tableBody.innerHTML = "";
            if (querySnapshot.empty) {
                tableBody.innerHTML = "<tr><td colspan='4' style='padding: 15px; text-align: center; color: #aaa;'>資料庫中沒有任何帳號紀錄。</td></tr>";
                return;
            }

            let usersList = [];
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                usersList.push({
                    id: doc.id,
                    robloxId: userData.robloxId || "未設定 ID",
                    role: userData.role || "member",
                    status: userData.status || "pending"
                });
            });

            // 客製排序：管理員置頂 + 字母 A-Z 順序
            usersList.sort((a, b) => {
                const aIsAdmin = a.role === 'admin' ? 1 : 0;
                const bIsAdmin = b.role === 'admin' ? 1 : 0;

                if (aIsAdmin !== bIsAdmin) {
                    return bIsAdmin - aIsAdmin;
                }
                return a.robloxId.localeCompare(b.robloxId, undefined, { sensitivity: 'base' });
            });

            usersList.forEach((user) => {
                const userId = user.id;
                const robloxId = user.robloxId;
                const role = user.role;
                const status = user.status;

                let statusBadge = `<span style="color: #28a745; font-weight: bold;">已核准 (approved)</span>`;
                if (status === "pending") {
                    statusBadge = `<span style="color: #ffc107; font-weight: bold;">待審核 (pending)</span>`;
                }

                let roleBadge = role === "admin" ? `<span style="color: #ff4d4d; font-weight: bold;">👑 管理員 (admin)</span>` : `一般隊員 (member)`;

                tableBody.innerHTML += `
                    <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                        <td style="padding: 12px;">
                            <a href="profile.html?uid=${userId}" style="color: #fff; font-weight: bold; text-decoration: underline;" title="查看檔案">
                                ${robloxId}
                            </a>
                        </td>
                        <td style="padding: 12px;">${roleBadge}</td>
                        <td style="padding: 12px;">${statusBadge}</td>
                        <td style="padding: 12px;">
                            ${role !== 'admin' ? `<button onclick="toggleAdminRole('${userId}', '${robloxId}', '${role}')" style="background: #17a2b8; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-right: 5px;">設為管理員</button>` : ''}
                            <button onclick="deleteAccount('${userId}', '${robloxId}')" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">刪除</button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch((error) => {
            console.error("抓取所有帳號失敗：", error);
        });
}

function approveUser(userId, userName) {
    if (confirm(`確認要核准 ${userName} 的帳號申請嗎？`)) {
        db.collection("users").doc(userId).update({ status: "approved" })
            .then(() => { 
                alert(`已成功核准 ${userName}！`); 
                fetchPendingRegistrations(); 
                fetchAllUsers();
            })
            .catch((error) => { 
                alert(`核准失敗：${error.message}`); 
            });
    }
}

function rejectUser(userId, userName) {
    if (confirm(`確認要拒絕/刪除 ${userName} 的帳號嗎？`)) {
        db.collection("users").doc(userId).delete()
            .then(() => { 
                alert(`已刪除 ${userName} 的資料。`); 
                fetchPendingRegistrations(); 
                fetchAllUsers();
            })
            .catch((error) => { 
                alert(`操作失敗：${error.message}`); 
            });
    }
}

function deleteAccount(userId, userName) {
    rejectUser(userId, userName);
}

function toggleAdminRole(userId, userName, currentRole) {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    if (confirm(`確認要將 ${userName} 的身份改為 ${newRole} 嗎？`)) {
        db.collection("users").doc(userId).update({ role: newRole })
            .then(() => {
                alert(`已成功將 ${userName} 設為 ${newRole}！`);
                fetchAllUsers();
            })
            .catch((error) => {
                alert(`設定失敗：${error.message}`);
            });
    }
}