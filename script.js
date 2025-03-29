


// $(document).ready(function () {
//     console.log("jQuery is working!");

//     var prizes = [50, 100, 120, 150];
//     var spinLocation;

//     var selectedPrize = prizes[Math.floor(Math.random() * prizes.length)];

//     var stopPoints = {
//         50: 60,
//         100: 120,
//         120: 210,
//         150: 270
//     };

//     spinLocation = stopPoints[selectedPrize];

//     $("#arrow").click(function () {
//         console.log("Arrow clicked! Spinning...");
//         $("#arrow").unbind("click");

//         gsap.to("#wheel", {
//             duration: 4,
//             rotation: spinLocation + 360 * 3,
//             ease: "power3.out",
//             onComplete: showWinDetails
//         });
//     });

//     function showWinDetails() {
//         console.log("Winner Selected!");

//         var now = new Date();
//         var dateTime = now.toLocaleString();
//         var uniqueCode = Math.floor(100000 + Math.random() * 900000);

//         var winMessage = `
//             <div class="winner-info" id="winnerBox">
//                 <h2>🎉 অভিনন্দন! আপনি ${selectedPrize} টাকা জিতেছেন! 🎉</h2>
//                 <p><strong>তারিখ ও সময়:</strong> ${dateTime}</p>
//                 <p><strong>আপনার ইউনিক কোড:</strong> <span class="code">${uniqueCode}</span></p>
//                 <button id="saveImage"> Save Full Screen</button>
//             </div>
//         `;

//         $("#revealContent").html(winMessage);
//         gsap.to("#spinnerGame", { duration: 0.5, autoAlpha: 0, delay: 0.5 });
//         gsap.to("#revealContent", { duration: 1, opacity: 1, display: "block", zIndex: "0", delay: 1.2 });
//         startConfetti();

//         setTimeout(() => {
//             $("#saveImage").fadeIn();
//             $("#saveImage").click(saveFullScreenImage);
//         }, 1000);

//         // Save spin result in Supabase
//         const userIpOrPhone = 'user_ip_or_phone_value';  // Replace this with the actual IP or Phone number
//         saveSpinResult(userIpOrPhone, selectedPrize);
//     }

//     // 🎊 Confetti Effect Function (No Conflict)
//     function startConfetti() {
//         var duration = 5 * 1000;
//         var animationEnd = Date.now() + duration;
//         var colors = ["#bb0000", "#ff8000", "#ffdd00", "#00aaff", "#33cc33"];

//         (function frame() {
//             confetti({
//                 particleCount: 5,
//                 spread: 60,
//                 origin: { x: Math.random(), y: Math.random() * 0.6 },
//                 colors: colors
//             });

//             if (Date.now() < animationEnd) {
//                 requestAnimationFrame(frame);
//             }
//         })();
//     }

//     // 📷 "Save Full Screen" button click to capture screenshot
//     function saveFullScreenImage() {
//         html2canvas(document.body).then(canvas => {  
//             let image = canvas.toDataURL("image/png"); 

//             let link = document.createElement("a");
//             link.href = image;
//             link.download = "full_screen_winner.png";  
//             link.click();
//         });
//     }

// });
