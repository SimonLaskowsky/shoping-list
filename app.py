import sqlite3
from flask import Flask, g, render_template, request, jsonify
import os.path

app = Flask(__name__)

def connection_db():
    sql = sqlite3.connect('shopping.db')
    sql.row_factory = sqlite3.Row
    return sql

def get_db():
    if not hasattr(g, 'sqlite3'):
        g.sqlite_db = connect_db()
    return g.sqlite3_db

@app.teardown_appcontext
def close_db(error):
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()

@app.route('/')
def index():
    return render_template("layout.html") 

@app.route('/todos', methods=['GET'])
def get_todos():
  conn = connection_db()
  todos = conn.execute('SELECT * FROM todos').fetchall()
  conn.close()
  return jsonify([{'id': todo['id'], 'item': todo['item']} for todo in todos])

@app.route('/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    conn = connection_db()
    item = request.json['item']
    conn.execute('UPDATE todos SET item = ? WHERE id = ?', (item, todo_id))
    conn.commit()
    conn.close()
    return jsonify({'id': todo_id, 'item': item})

@app.route('/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    conn = connection_db()
    conn.execute('DELETE FROM todos WHERE id = ?', (todo_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/todos', methods=['POST'])
def add_todo():
    conn = connection_db() 
    item = request.json['item']
    print(item)
    cursor = conn.execute('INSERT INTO todos (item) VALUES (?)', (item,))
    new_todo_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return jsonify({'id': new_todo_id, 'item': item}) 

if __name__ == '__main__':
    app.run(debug=True)