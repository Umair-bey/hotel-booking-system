const API = 'http://localhost:3000/api';

// Load all rooms on page load
window.onload = () => {
  loadRooms();
  loadBookings();
};

// ---------- ROOMS ----------
async function loadRooms() {
  const res = await fetch(`${API}/rooms`);
  const rooms = await res.json();
  renderRooms(rooms);
}

async function addRoom() {
  const room_no = document.getElementById('roomNo').value.trim();
  const type = document.getElementById('roomType').value.trim();
  const priceValue = document.getElementById('roomPrice').value;
  const price = parseFloat(priceValue);

  if (!room_no || !type || isNaN(price)) {
    alert('Please fill all fields correctly.');
    return;
  }

  try {
    const res = await fetch(`${API}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_no, type, price })
    });

    const data = await res.json();
    
    if (res.ok) {
      document.getElementById('roomNo').value = '';
      document.getElementById('roomType').value = '';
      document.getElementById('roomPrice').value = '';
      loadRooms(); 
    } else {
      alert('Error: ' + data.error); // This will show exactly what went wrong
    }
  } catch (err) {
    alert('Network error, check console.');
    console.error(err);
  }
}

async function searchAvailable() {
  const type = document.getElementById('searchType').value.trim();
  const check_in = document.getElementById('searchIn').value;
  const check_out = document.getElementById('searchOut').value;

  if (!check_in || !check_out) {
    alert('Please pick both Check-in and Check-out dates.');
    return;
  }

  const url = `${API}/rooms/available?type=${encodeURIComponent(type)}&check_in=${check_in}&check_out=${check_out}`;
  const res = await fetch(url);
  const rooms = await res.json();
  renderRooms(rooms);
}

function renderRooms(rooms) {
  const container = document.getElementById('roomList');
  container.innerHTML = '';

  if (rooms.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No rooms found.</p>';
    return;
  }

  rooms.forEach(room => {
    const div = document.createElement('div');
    div.className = 'room';
    
    div.innerHTML = `
      <div>
        <strong>Room #${room.room_no}</strong> 
        <span class="status-badge">AVAILABLE</span>
        <div class="room-details">
          ${room.type} &bull; ₹${room.price} / night
        </div>
      </div>
      <button class="book-btn" onclick="bookRoom('${room._id}')">Book Now</button>
    `;
    container.appendChild(div);
  });
}

async function bookRoom(room_id) {
  const guest_name = prompt('Guest name:');
  if (!guest_name) return;

  const check_in = prompt('Check-in (YYYY-MM-DD):');
  const check_out = prompt('Check-out (YYYY-MM-DD):');
  if (!check_in || !check_out) return;

  const res = await fetch(`${API}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ room_id, guest_name, check_in, check_out })
  });

  const data = await res.json();
  if (res.ok) {
    loadBookings();
  } else {
    alert(data.error); 
  }
}

// ---------- BOOKINGS ----------
async function loadBookings() {
  const res = await fetch(`${API}/bookings`);
  const bookings = await res.json();
  renderBookings(bookings);
}

function renderBookings(bookings) {
  const container = document.getElementById('bookingList');
  container.innerHTML = '';

  if (bookings.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No active bookings.</p>';
    return;
  }

  bookings.forEach(b => {
    const div = document.createElement('div');
    div.className = 'booking';
    
    div.innerHTML = `
      <div>
        <strong>${b.guest_name}</strong>
        <div class="room-details">
          Room ID: ${b.room_id.slice(-6)} &bull; 📅 ${b.check_in} ➔ ${b.check_out}
        </div>
      </div>
      <button class="cancel-btn" onclick="cancelBooking('${b._id}')">Cancel</button>
    `;
    container.appendChild(div);
  });
}

async function cancelBooking(id) {
  if (!confirm('Are you sure you want to cancel this booking?')) return;

  const res = await fetch(`${API}/bookings/${id}`, { method: 'DELETE' });
  const data = await res.json();

  if (res.ok) {
    loadBookings(); 
  } else {
    alert(data.error);
  }
}