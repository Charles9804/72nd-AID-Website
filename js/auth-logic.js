// js/auth-logic.js

// 1. 處理註冊邏輯
document.getElementById("btn-register-submit").addEventListener("click", (e) => {
    e.preventDefault();
    const robloxId = document.getElementById("roblox-id").value.trim();
    const password = document.getElementById("auth-password").value;

    if (!robloxId || password.length < 6) {
        alert("請輸入Roblox ID與密碼（至少6位）");
        return;
    }

    const email = robloxId + "@roblox.com";

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            return db.collection("users").doc(user.uid).set({
                uid: user.uid,
                robloxId: robloxId,
                status: "pending",
                role: "member",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        })
        .then(() => {
            alert("註冊申請已送出！管理員審核通過後即可登入。");
            auth.signOut();
            window.location.reload();
        })
        .catch((error) => {
            console.error("註冊失敗：", error);
            if (error.code === 'auth/email-already-in-use') {
                alert('該 Roblox ID 已被註冊過！');
            } else {
                alert('註冊失敗：' + error.message);
            }
        });
});

// 2. 處理登入邏輯
document.getElementById("btn-login-submit").addEventListener("click", (e) => {
    e.preventDefault();
    const robloxId = document.getElementById("roblox-id").value.trim();
    const password = document.getElementById("auth-password").value;

    if (!robloxId || !password) { 
        alert("請輸入Roblox ID和密碼"); 
        return; 
    }
    const email = robloxId + "@roblox.com";

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            return db.collection("users").doc(user.uid).get();
        })
        .then((doc) => {
            if (doc.exists && doc.data().status === "approved") {
                alert("登入成功！");
                window.location.href = "../index.html";
            } else {
                alert("您的帳號尚未通過管理員審核，暫時無法登入！");
                auth.signOut();
            }
        })
        .catch((error) => {
            console.error("登入失敗：", error);
            alert("登入失敗：帳號或密碼錯誤");
        });
});