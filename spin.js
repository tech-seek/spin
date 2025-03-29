// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBWa0yZTxye_Xj4c02HXkF5t8mr8PHtFA0",
    authDomain: "spin-2e869.firebaseapp.com",
    databaseURL: "https://spin-2e869-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "spin-2e869",
    storageBucket: "spin-2e869.firebasestorage.app",
    messagingSenderId: "20077839460",
    appId: "1:20077839460:web:d5178cf14d6b7fbe378b71",
    measurementId: "G-4313S6S1N1"
};

// Initialize Firebase App and Database
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Generate a unique device ID for the user
const userDeviceID = localStorage.getItem('deviceID') || generateUniqueDeviceID();
localStorage.setItem('deviceID', userDeviceID);

// Generate a unique device ID if it doesn't exist
function generateUniqueDeviceID() {
    return 'device-' + Math.random().toString(36).substr(2, 9);
}

// Fetch user's IP address
async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error("Error fetching IP:", error);
        return null;
    }
}

$(document).ready(function () {
    console.log("jQuery is working!");

    var prizes = [50, 75, 100, 120, 150];
    var spinLocation;
    var selectedPrize = prizes[Math.floor(Math.random() * prizes.length)];
    var stopPoints = { 50: 60, 100: 120, 120: 210, 150: 270 };
    spinLocation = stopPoints[selectedPrize];

    // Check if the user can spin based on IP
    async function canSpin() {
        const userIP = await getUserIP();
        if (!userIP) {
            showErrorPopup("Unable to fetch IP. Please try again later.");
            return false;
        }

        const sanitizedIP = userIP.replace(/\./g, '_');
        const ipSpinRef = ref(db, 'ip_spins/' + sanitizedIP);

        return new Promise((resolve, reject) => {
            get(ipSpinRef).then((snapshot) => {
                if (snapshot.exists()) {
                    showPreviousSpinResult(sanitizedIP);
                    resolve(false);
                } else {
                    resolve(true);
                }
            }).catch((error) => {
                console.error("Error fetching IP spin data:", error);
                showErrorPopup("Error checking spin data. Please try again later.");
                reject(error);
            });
        });
    }

    // Show previous spin result if they can't spin again
    function showPreviousSpinResult(sanitizedIP) {
        const ipSpinRef = ref(db, 'ip_spins/' + sanitizedIP);
        
        get(ipSpinRef).then((snapshot) => {
            if (snapshot.exists()) {
                const previousSpin = snapshot.val();
                const previousPrize = previousSpin.prize;
                const previousTime = new Date(previousSpin.timestamp).toLocaleString();
                const previousUUID = previousSpin.uuid;
                const previousCode = previousSpin.uniqueCode;
                const whatsapp = previousSpin.whatsapp || "Not provided";
                const imo = previousSpin.imo || "Not provided";

                const winMessage = `
                    <div class="winner-info" id="winnerBox">
                        <h2>🎉 You Already Spun!</h2>
                        <p><strong>Your previous prize was:</strong> ${previousPrize}</p>
                        <p><strong>Spin Time:</strong> ${previousTime}</p>
                        <p><strong>Your Device UUID:</strong> ${previousUUID}</p>
                        <p><strong>Your Previous Unique Code:</strong> ${previousCode}</p>
                        <p><strong>WhatsApp:</strong> ${whatsapp}</p>
                        <p><strong>IMO:</strong> ${imo}</p>
                        <button id="saveImage">Save Full Screen</button>
                        <button id="whatsappContact">Contact via WhatsApp</button>
                        <button id="telegramContact">Contact via Telegram</button>
                        <button id="closePopup">Close</button>
                    </div>
                `;

                console.log("Injecting previous spin message into #revealContent");
                $("#revealContent").html(winMessage);
                gsap.to("#spinnerGame", { duration: 0.5, autoAlpha: 0, delay: 0.5 });
                gsap.to("#revealContent", { duration: 1, opacity: 1, display: "block", zIndex: 0, delay: 1.2 });

                setTimeout(() => {
                    console.log("Showing buttons for previous spin");
                    $("#saveImage").css("display", "block").fadeIn();
                    $("#whatsappContact").css("display", "block").fadeIn();
                    $("#telegramContact").css("display", "block").fadeIn();

                    $("#saveImage").off('click').on('click', saveFullScreenImage);

                    let supportNumber = "8801712345678"; // Replace with your actual support number
                    let whatsappNumber = whatsapp !== "Not provided" ? whatsapp : supportNumber;
                    let telegramNumber = imo !== "Not provided" ? imo : supportNumber;

                    const whatsappMessage = `I won ৳${previousPrize}! My unique code is ${previousCode}. Please assist me.`;
                    const telegramMessage = `I won ৳${previousPrize}! My unique code is ${previousCode}. Please assist me.`;

                    console.log("Binding WhatsApp button with number:", whatsappNumber);
                    $("#whatsappContact").off('click').on('click', () => {
                        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
                    });

                    console.log("Binding Telegram button with number:", telegramNumber);
                    $("#telegramContact").off('click').on('click', () => {
                        window.open(`https://t.me/+${telegramNumber}?text=${encodeURIComponent(telegramMessage)}`, '_blank');
                    });

                    $("#closePopup").off('click').on('click', function() {
                        window.location.href = "/"; // Redirect to homepage
                    });
                }, 1000);
            }
        }).catch((error) => {
            console.error("Error fetching previous spin result:", error);
            showErrorPopup("Error fetching previous spin result.");
        });
    }

    // Handle the spin action when the arrow is clicked
    $("#arrow").click(async function () {
        console.log("Arrow clicked! Spinning...");

        const allowed = await canSpin();
        if (allowed) {
            $("#arrow").unbind("click");
            gsap.to("#wheel", {
                duration: 4,
                rotation: spinLocation + 360 * 3,
                ease: "power3.out",
                onComplete: showWinDetails
            });
        }
    });

    // Show the winning message and contact form
    async function showWinDetails() {
        console.log("Winner Selected!");

        var now = new Date();
        var dateTime = now.toLocaleString();
        var uniqueCode = Math.floor(100000 + Math.random() * 900000);

        const userIP = await getUserIP();
        const sanitizedIP = userIP.replace(/\./g, '_');
        const ipSpinRef = ref(db, 'ip_spins/' + sanitizedIP);
        const snapshot = await get(ipSpinRef);
        const hasContactInfo = snapshot.exists() && (snapshot.val().whatsapp || snapshot.val().imo);

        let winMessage;
        if (!hasContactInfo) {
            winMessage = `
                <div class="winner-info" id="winnerBox">
                    <h2>অভিনন্দন! </h2> 
                    <p><strong>Date & Time:</strong> ${dateTime}</p>
                    
                    <div class="contact-form">
                    <p><strong>Your Unique Code:</strong> <span class="code">${uniqueCode}</span></p>
  <h2> আপনি জিতেছেন ${selectedPrize}৳!</h2>
                        <div class="input-group">
                            <label>এখানে IMO নম্বর দিন</label>
                            <input type="tel" id="imo" placeholder="e.g., 01712345678">
                        </div>
                        <div class="input-group">
                            <label>এখানে WhatsApp নম্বর দিন</label>
                            <input type="tel" id="whatsapp" placeholder="e.g., 01712345678">
                        </div>
                        <button id="submitContact">Submit</button>
                        <button id="saveImage">Save Full Screen</button>
                    <button id="whatsappContact">Contact via WhatsApp</button>
                    <button id="telegramContact">Contact via Telegram</button>
                    </div>
                    
                </div>
            `;
        } else {
            const previousSpin = snapshot.val();
            const whatsapp = previousSpin.whatsapp || "Not provided";
            const imo = previousSpin.imo || "Not provided";
            winMessage = `
                <div class="winner-info" id="winnerBox">
                    <h2>অভিনন্দন!</h2>
                    <p><strong>Date & Time:</strong> ${dateTime}</p>
                    <p><strong>Your Unique Code:</strong> <span class="code">${uniqueCode}</span></p>
                    <h2>আপনি জিতেছেন ৳${selectedPrize}!</h2>
                    <p><strong>WhatsApp:</strong> ${whatsapp}</p>
                    <p><strong>IMO:</strong> ${imo}</p>
                    <p id="contactStatus">এসএমএস-এর মাধ্যমে আপনার সাথে যোগাযোগ করা হবে। ধন্যবাদ!</p>
                    <button id="saveImage">Save Full Screen</button>
                    <button id="whatsappContact">Contact via WhatsApp</button>
                    <button id="telegramContact">Contact via Telegram</button>
                </div>
            `;
        }

        console.log("Injecting winMessage into #revealContent");
        $("#revealContent").html(winMessage);
        gsap.to("#spinnerGame", { duration: 0.5, autoAlpha: 0, delay: 0.5 });
        gsap.to("#revealContent", { duration: 1, opacity: 1, display: "block", zIndex: 0, delay: 1.2 });
        startConfetti();

        setTimeout(() => {
            console.log("Showing buttons for new spin");
            $("#saveImage").css("display", "block").fadeIn();
            $("#whatsappContact").css("display", "block").fadeIn();
            $("#telegramContact").css("display", "block").fadeIn();

            $("#saveImage").off('click').on('click', saveFullScreenImage);

            let supportNumber = "8801712345678"; // Replace with your actual support number
            let whatsappNumber = $("#whatsapp").val() || supportNumber;
            let telegramNumber = $("#imo").val() || supportNumber;

            const whatsappMessage = `I won ৳${selectedPrize}! My unique code is ${uniqueCode}. Please assist me.`;
            const telegramMessage = `I won ৳${selectedPrize}! My unique code is ${uniqueCode}. Please assist me.`;

            console.log("Binding WhatsApp button with number:", whatsappNumber);
            $("#whatsappContact").off('click').on('click', () => {
                window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
            });

            console.log("Binding Telegram button with number:", telegramNumber);
            $("#telegramContact").off('click').on('click', () => {
                window.open(`https://t.me/+${telegramNumber}?text=${encodeURIComponent(telegramMessage)}`, '_blank');
            });

            if (!hasContactInfo) {
                $("#submitContact").css("display", "block").fadeIn();
                $("#submitContact").off('click').on('click', () => submitContactInfo(uniqueCode, userIP));
            }
        }, 1000);

        if (userIP && !hasContactInfo) {
            saveSpinResult(selectedPrize, uniqueCode, userIP);
        }
    }

    // Submit WhatsApp or IMO number (at least one required)
    async function submitContactInfo(uniqueCode, userIP) {
        const whatsapp = $("#whatsapp").val().trim();
        const imo = $("#imo").val().trim();

        const whatsappValid = whatsapp && /^\d{10,11}$/.test(whatsapp);
        const imoValid = imo && /^\d{10,11}$/.test(imo);

        if (!whatsappValid && !imoValid) {
            showErrorPopup("অন্তত একটি বৈধ ১০-১১ ডিজিটের WhatsApp বা IMO নম্বর দিন।");
            return;
        }

        console.log("Submitting contact info:", { whatsapp, imo });
        const sanitizedIP = userIP.replace(/\./g, '_');
        saveSpinResult(selectedPrize, uniqueCode, userIP, whatsapp || null, imo || null);

        $("#contactStatus").remove();
        $(".contact-form").after('<p id="contactStatus">এসএমএস-এর মাধ্যমে আপনার সাথে যোগাযোগ করা হবে। ধন্যবাদ!</p>');
        $("#submitContact").hide();
        $("#whatsapp").prop("disabled", true);
        $("#imo").prop("disabled", true);

        // Update contact buttons with submitted numbers
        $("#whatsappContact").off('click').on('click', () => {
            window.open(`https://wa.me/${whatsapp || '8801712345678'}?text=${encodeURIComponent(`I won ৳${selectedPrize}! My unique code is ${uniqueCode}. Please assist me.`)}`, '_blank');
        });
        $("#telegramContact").off('click').on('click', () => {
            window.open(`https://t.me/+${imo || '8801712345678'}?text=${encodeURIComponent(`I won ৳${selectedPrize}! My unique code is ${uniqueCode}. Please assist me.`)}`, '_blank');
        });
    }

    // Save the spin result in Firebase
    function saveSpinResult(prize, uniqueCode, userIP, whatsapp = null, imo = null) {
        const currentTime = new Date().getTime();
        const sanitizedIP = userIP.replace(/\./g, '_');
        const ipSpinRef = ref(db, 'ip_spins/' + sanitizedIP);

        const spinData = {
            prize: prize,
            timestamp: currentTime,
            uuid: userDeviceID,
            uniqueCode: uniqueCode
        };
        if (whatsapp) spinData.whatsapp = whatsapp;
        if (imo) spinData.imo = imo;

        set(ipSpinRef, spinData).then(() => {
            console.log("Spin result saved with IP!", spinData);
        }).catch((error) => {
            console.error("Error saving spin result:", error);
            showErrorPopup("Error saving spin result.");
        });
    }

    // Confetti effect
    function startConfetti() {
        var duration = 5 * 1000;
        var animationEnd = Date.now() + duration;
        var colors = ["#bb0000", "#ff8000", "#ffdd00", "#00aaff", "#33cc33"];

        (function frame() {
            confetti({
                particleCount: 5,
                spread: 60,
                origin: { x: Math.random(), y: Math.random() * 0.6 },
                colors: colors
            });

            if (Date.now() < animationEnd) {
                requestAnimationFrame(frame);
            }
        })();
    }

    // Save full screen image
    function saveFullScreenImage() {
        console.log("Attempting to save full screen image...");
        html2canvas(document.body, {
            scale: 2,
            useCORS: true,
            logging: true
        }).then(canvas => {
            console.log("Canvas generated successfully");
            let image = canvas.toDataURL("image/png");
            let link = document.createElement("a");
            link.href = image;
            link.download = "full_screen_winner.png";
            link.click();
            console.log("Image download triggered");
        }).catch((error) => {
            console.error("Error capturing screenshot:", error);
            showErrorPopup("Failed to save screenshot. Please try again.");
        });
    }

    // Show an error popup
    function showErrorPopup(message) {
        const popup = `<div id="errorPopup" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 1000;"><p>${message}</p><button onclick="$('#errorPopup').remove()">OK</button></div>`;
        $("body").append(popup);
    }
});

html2canvas(document.body, {
    scale: window.devicePixelRatio,  // This ensures the image is clear on high-DPI screens.
    useCORS: true
}).then(canvas => {
    let image = canvas.toDataURL("image/png");
    let link = document.createElement("a");
    link.href = image;
    link.download = "full_screen_winner.png";
    link.click();
});
