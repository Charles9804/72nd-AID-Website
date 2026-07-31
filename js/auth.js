// js/auth.js
// 全域監聽 Firebase 登入狀態
auth.onAuthStateChanged((user) => {
    const navUserInfo = document.getElementById("nav-user-info");
    const navUserName = document.getElementById("nav-user-name");
    const btnLogin = document.getElementById("btn-login");
    const btnAdminLink = document.getElementById("btn-admin-link");

    if (user) {
        if (btnLogin) btnLogin.style.display = "none";
        if (navUserInfo) navUserInfo.style.display = "flex";

        let displayName = user.email ? user.email.split("@")[0] : "官兵";

        db.collection("users").doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    if (userData.robloxId) {
                        displayName = userData.robloxId;
                    }

                    if (userData.role === "admin" && btnAdminLink) {
                        btnAdminLink.style.display = "inline-block";
                    }
                }

                if (navUserName) {
                    navUserName.textContent = "歡迎, " + displayName;
                    const isPagesFolder = window.location.pathname.includes("/pages/");
                    navUserName.href = isPagesFolder ? "profile.html" : "pages/profile.html";
                }
            })
            .catch((error) => {
                console.error("讀取使用者資料失敗：", error);
                if (navUserName) navUserName.textContent = "歡迎, " + displayName;
            });

    } else {
        if (btnLogin) btnLogin.style.display = "block";
        if (navUserInfo) navUserInfo.style.display = "none";
        if (btnAdminLink) btnAdminLink.style.display = "none";
    }
});

// 處理登出
const btnLogout = document.getElementById("btn-logout");
if (btnLogout) {
    btnLogout.addEventListener("click", () => {
        auth.signOut().then(() => {
            alert("已成功登出");
            const isPagesFolder = window.location.pathname.includes("/pages/");
            window.location.href = isPagesFolder ? "../index.html" : "index.html";
        }).catch((error) => {
            console.error("登出失敗", error);
        });
    });
}