const token = localStorage.getItem('token');
if (!token) window.location.href = 'index.html';

const empForm = document.getElementById('emp-form');
const empTableBody = document.querySelector('#emp-table tbody');
const empMsg = document.getElementById('emp-msg');
const empSubmitBtn = document.getElementById('emp-submit-btn');
const backBtn = document.getElementById('back-btn');

backBtn.onclick = () => window.location.href = 'dashboard.html';

function fetchEmployees() {
    fetch('http://localhost:5000/employees', {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(data => {
        empTableBody.innerHTML = '';
        data.forEach(emp => {
            empTableBody.innerHTML += `<tr>
                <td>${emp.id}</td>
                <td>${emp.employee_id}</td>
                <td>${emp.name}</td>
                <td>${emp.role}</td>
                <td>
                    <button onclick="editEmp(${emp.id}, '${emp.employee_id}', '${emp.name}', '${emp.role}')">Edit</button>
                    <button onclick="deleteEmp(${emp.id})">Delete</button>
                </td>
            </tr>`;
        });
    });
}

window.editEmp = function(id, employee_id, name, role) {
    document.getElementById('emp-db-id').value = id;
    document.getElementById('employee_id').value = employee_id;
    document.getElementById('name').value = name;
    document.getElementById('role').value = role;
    empSubmitBtn.textContent = 'Update Employee';
};

window.deleteEmp = function(id) {
    if (!confirm('Delete this employee?')) return;
    fetch(`http://localhost:5000/employees/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(data => {
        empMsg.textContent = data.msg;
        fetchEmployees();
    });
};

empForm.onsubmit = function(e) {
    e.preventDefault();
    empMsg.textContent = '';
    const id = document.getElementById('emp-db-id').value;
    const employee_id = document.getElementById('employee_id').value;
    const name = document.getElementById('name').value;
    const role = document.getElementById('role').value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:5000/employees/${id}` : 'http://localhost:5000/employees';
    const body = id ? { name, role } : { employee_id, name, role };
    fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(body)
    })
    .then(res => res.json())
    .then(data => {
        empMsg.textContent = data.msg;
        empForm.reset();
        empSubmitBtn.textContent = 'Add Employee';
        fetchEmployees();
    });
};

fetchEmployees();
