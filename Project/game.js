const thailandBounds = L.latLngBounds(L.latLng(5.0, 97.0), L.latLng(21.0, 106.0));
const map = L.map('map', {
    center: [13.0, 101.5], zoom: 6, minZoom: 5,
    maxBounds: thailandBounds, maxBoundsViscosity: 1.0
});

const layers = {
    street: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'OSM' }),
    topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { maxZoom: 17, attribution: 'OpenTopoMap' }),
    sat: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Esri' })
};
let currentLayer = layers.street;
currentLayer.addTo(map);

let totalScore = parseInt(localStorage.getItem('geoTotalScore')) || 0;
document.getElementById('total-score').innerText = totalScore;

let currentLevelScore = 10;
let isLevelDone = false;

const levels = [
    { title: "1. เมืองเก่าอยุธยา", desc: "วอร์มเครื่อง! จงหาตำแหน่งของ <b>'จ.พระนครศรีอยุธยา'</b> ", hints: ["ใช้ 'แผนที่ถนน' จะหาง่ายที่สุด"], target: [14.3532, 100.5684], radius: 35000, zoom: 7, center: [14.0, 100.5] },
    { title: "2. หนีน้ำท่วม (น่าน)", desc: "หาทางหนีน้ำท่วม! 'จงหาภูเขาสูง' ที่เป็นที่หลบภัยของชาวน่านในช่วงน้ำท่วมใหญ่ ", hints: ["ลองเปลี่ยนเป็น 'แผนที่ความสูง'ดูนะ"], checkType: "topo_nan", zoom: 10, center: [18.78, 100.78] },
    { title: "3. ปอดกรุงเทพฯ (บางกะเจ้า)", desc: "จงหาพื้นที่สีเขียวรูป <b>'กระเพาะหมู'</b> ที่ถูกล้อมด้วยแม่น้ำเจ้าพระยา (สมุทรปราการ)", hints: ["อยู่ทิศใต้ของกรุงเทพฯ", "มองหาพื้นที่ป่าสีเขียวขนาดใหญ่"], target: [13.695, 100.560], radius: 4000, zoom: 11, center: [13.70, 100.55] },
    { title: "4. ถ้ำหลวง (เชียงราย)", desc: "ภารกิจกู้ภัย! จงหา <b>'เทือกเขาดอยนางนอน'</b> (ที่ตั้งถ้ำหลวง) เหนือ อ.แม่สาย", hints: ["ไปที่เหนือสุดของประเทศ (เชียงราย)", "ลองเปลี่ยนเป็น 'แผนที่ความสูง'ดูนะ"], target: [20.3800, 99.8600], radius: 5000, zoom: 12, center: [20.40, 99.88] },
    { title: "5. ท่าเรือแหลมฉบัง (ชลบุรี)", desc: "ศูนย์กลางขนส่งทางทะเล! จงหาท่าเรือน้ำลึกที่มี <b>'ตู้คอนเทนเนอร์'</b> ยื่นลงไปในทะเล", hints: ["เปลี่ยนเป็น 'ภาพดาวเทียม'", "อยู่ชายฝั่งชลบุรี (ใกล้พัทยา)"], target: [13.085, 100.880], radius: 4000, zoom: 11, center: [13.10, 100.90] },
    { title: "6. ทะเลสาบสงขลา", desc: "จงหา <b>'ทะเลสาบที่ใหญ่ที่สุด'</b> ในประเทศไทย (ภาคใต้)", hints: ["มองหาแหล่งน้ำขนาดใหญ่ใกล้หาดใหญ่", "ซูมดูแผนที่ถนนจะเห็นชื่อชัดเจน"], target: [7.450, 100.300], radius: 20000, zoom: 9, center: [7.20, 100.40] },
    { title: "7. ภูทับเบิก (เพชรบูรณ์)", desc: "หาจุดชมวิวทะเลหมอก! จงหา <b>'ยอดเขาสูง'</b> ที่มีถนนคดเคี้ยว ใน จ.เพชรบูรณ์", hints: ["ลองเปลี่ยนเป็น 'แผนที่ความสูง'ดูนะ", "อยู่รอยต่อระหว่างหล่มเก่า-ด่านซ้าย"], target: [16.900, 101.100], radius: 6000, zoom: 11, center: [16.85, 101.15] },
    { title: "8. เกาะสมุย (สุราษฎร์ธานี)", desc: "จงหา <b>'เกาะท่องเที่ยวขนาดใหญ่'</b> ในอ่าวไทย", hints: ["อยู่ทางขวาของสุราษฎร์ธานี", "เป็นเกาะใหญ่ที่มีสนามบิน"], target: [9.500, 100.000], radius: 10000, zoom: 9, center: [9.30, 99.80] },
    { title: "9. เขื่อนภูมิพล (ตาก)", desc: "จงหา <b>'เขื่อนคอนกรีตโค้ง'</b> ขนาดใหญ่กั้นแม่น้ำปิง", hints: ["ใช้ภาพดาวเทียมจะเห็นสันเขื่อนชัด", "อยู่ทางเหนือของ จ.ตาก"], target: [17.243, 98.973], radius: 3000, zoom: 12, center: [17.20, 99.00] },
    { title: "10. พระปฐมเจดีย์ (นครปฐม)", desc: "ด่านสุดท้าย! จงหา <b>'เจดีย์สีทองที่ใหญ่ที่สุด'</b> ใจกลางเมืองนครปฐม", hints: ["ดูจากภาพดาวเทียมจะเห็นองค์เจดีย์กลมใหญ่"], target: [13.819, 100.060], radius: 1000, zoom: 14, center: [13.82, 100.06] }
];

function switchMap(type, btn) {
    map.removeLayer(currentLayer);
    currentLayer = layers[type];
    currentLayer.addTo(map);
    document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function loadCurrentLevel() {
    const lvl = levels[LEVEL_INDEX];
    document.getElementById('m-title').innerText = `${lvl.title} (${LEVEL_INDEX+1}/10)`;
    document.getElementById('m-desc').innerHTML = lvl.desc;
    document.getElementById('btn-next').style.display = 'none';
    
    const list = document.getElementById('hint-list');
    list.innerHTML = "";
    lvl.hints.forEach(h => { list.innerHTML += `<div class="hint-item"><i class="fas fa-search" style="color:#e67e22;"></i> ${h}</div>`; });

    map.flyTo(lvl.center, lvl.zoom, { duration: 1.5 });
}

map.on('click', function(e) {
    if(isLevelDone) return;
    const lvl = levels[LEVEL_INDEX];
    let isCorrect = false;

    if (lvl.checkType === "topo_nan") {
        const lng = e.latlng.lng;
        if (lng < 100.745 || lng > 100.815) isCorrect = true;
        else {
            L.rectangle([[18.6, 100.745], [19.0, 100.815]], {color: 'red', fillOpacity: 0.1, weight:1}).addTo(map);
        }
    } else {
        const dist = map.distance(e.latlng, lvl.target);
        if (dist <= lvl.radius) isCorrect = true;
    }

    if (isCorrect) {
        isLevelDone = true;
        totalScore += currentLevelScore;
        localStorage.setItem('geoTotalScore', totalScore); 
        document.getElementById('total-score').innerText = totalScore;
        
        L.popup().setLatLng(e.latlng).setContent("<b>ถูกต้อง! ภารกิจสำเร็จ</b>").openOn(map);
        if(lvl.target) L.circle(lvl.target, {color:'green', radius: lvl.radius}).addTo(map);
        
        const btn = document.getElementById('btn-next');
        btn.style.display = 'block';
        if(LEVEL_INDEX === levels.length - 1) btn.innerText = "สรุปผลคะแนน";
        
        btn.onclick = function() { window.location.href = NEXT_PAGE; };
    } else {
        if (currentLevelScore > 0) currentLevelScore -= 1;
        document.getElementById('level-score').innerText = currentLevelScore;
        document.getElementById('level-score').style.color = "#c0392b";
        L.popup().setLatLng(e.latlng).setContent("<b>ยังไม่ถูก! (หักคะแนน)</b><br>ลองเปลี่ยนแผนที่ หรืออ่านคำใบ้ดูนะ").openOn(map);
    }
});

loadCurrentLevel();