from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

bp = Blueprint('routes', __name__)

DB_PATH = 'server/employee.db'

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'msg': 'Missing username or password'}), 400
    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT id FROM users WHERE username = ?', (username,))
    if cur.fetchone():
        return jsonify({'msg': 'User already exists'}), 409
    hashed = generate_password_hash(password)
    cur.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, hashed))
    conn.commit()
    conn.close()
    return jsonify({'msg': 'User created'}), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT id, password FROM users WHERE username = ?', (username,))
    user = cur.fetchone()
    if user and check_password_hash(user['password'], password):
        access_token = create_access_token(identity=user['id'])
        return jsonify({'access_token': access_token}), 200
    return jsonify({'msg': 'Bad username or password'}), 401

@bp.route('/employees', methods=['GET'])
@jwt_required()
def get_employees():
    conn = get_db()
    cur = conn.cursor()
    cur.execute('SELECT * FROM employees')
    employees = [dict(row) for row in cur.fetchall()]
    conn.close()
    return jsonify(employees)

@bp.route('/employees', methods=['POST'])
@jwt_required()
def add_employee():
    data = request.json
    emp_id = data.get('employee_id')
    name = data.get('name')
    role = data.get('role')
    if not emp_id or not name or not role:
        return jsonify({'msg': 'Missing fields'}), 400
    conn = get_db()
    cur = conn.cursor()
    cur.execute('INSERT INTO employees (employee_id, name, role) VALUES (?, ?, ?)', (emp_id, name, role))
    conn.commit()
    conn.close()
    return jsonify({'msg': 'Employee added'}), 201

@bp.route('/employees/<int:id>', methods=['PUT'])
@jwt_required()
def update_employee(id):
    data = request.json
    name = data.get('name')
    role = data.get('role')
    conn = get_db()
    cur = conn.cursor()
    cur.execute('UPDATE employees SET name = ?, role = ? WHERE id = ?', (name, role, id))
    conn.commit()
    conn.close()
    return jsonify({'msg': 'Employee updated'})

@bp.route('/employees/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_employee(id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute('DELETE FROM employees WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'msg': 'Employee deleted'})
