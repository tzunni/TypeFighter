from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from dotenv import dotenv_values


app = Flask(__name__)

# Load configuration from .env file
config = dotenv_values(".env")
DATABASE_URL = config.get("DB_URL")

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define our database models
class Users(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(20), unique=False, nullable=False)
    pw_hash = db.Column(db.String(20), unique=False, nullable=False)
    email = db.Column(db.String(20), unique=False, nullable=False)
    def __repr__(self):
        return f'<User {self.user_name}>'

class Prompts(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    prompt = db.Column(db.String(200), unique=False, nullable=False)
    difficulty = db.Column(db.Integer, unique=False, nullable=False)
    source = db.Column(db.String(100), unique=False, nullable=False)
    def __repr__(self):
        return f'<Prompt {self.prompt_text}>'

class Runs(db.Model):
    run_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    wpm = db.Column(db.Integer, nullable=False)
    accuracy = db.Column(db.Float, nullable=False)
    prompt_id = db.Column(db.Integer, db.ForeignKey('prompts.id'), nullable=False)
    run_time = db.Column(db.DateTime, nullable=False)
    def __repr__(self):
        return f'<Run {self.run_id}>'

class Boss(db.Model):
    boss_id = db.Column(db.Integer, primary_key=True)
    boss_name = db.Column(db.String(20), unique=False, nullable=False)
    current_hp = db.Column(db.Integer, unique=False, nullable=False)
    img_location = db.Column(db.String(100), unique=False, nullable=False)
    dead = db.Column(db.Boolean, unique=False, nullable=False, default=False)
    max_hp = db.Column(db.Integer, unique=False, nullable=False)
    def __repr__(self):
        return f'<Boss {self.boss_name}>'

class stat_cache(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    speed_mean = db.Column(db.Integer, nullable=False)
    accuracy_mean = db.Column(db.Integer, nullable=False)

@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = db.session.get(Users, user_id)  # Use db.session.get()
    if user:
        return jsonify({
            'user_id': user.user_id,
            'user_name': user.user_name,
            'email': user.email
        }), 200
    else:
        return jsonify({'error': 'User not found'}), 404

@app.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    if not data or not all(key in data for key in ('user_name', 'pw_hash', 'email')):
        return jsonify({'error': 'Missing data'}), 400
    
    new_user = Users(
        user_name=data['user_name'],
        pw_hash=data['pw_hash'],
        email=data['email']
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        'user_id': new_user.user_id,
        'user_name': new_user.user_name,
        'email': new_user.email
    }), 201

@app.route('/prompts/<int:id>', methods=['GET'])
def get_prompt(id):
    prompt = db.session.get(Prompts, id)  # Use db.session.get()
    if prompt:
        return jsonify({
            'id': prompt.id,
            'prompt': prompt.prompt,
            'difficulty': prompt.difficulty,
            'source': prompt.source
        }), 200
    else:
        return jsonify({'error': 'Prompt not found'}), 404

@app.route('/runs', methods=['POST'])
def create_run():
    data = request.get_json()
    if not data or not all(key in data for key in ('user_id', 'wpm', 'accuracy', 'prompt_id', 'run_time')):
        return jsonify({'error': 'Missing data'}), 400
    
    new_run = Runs(
        user_id=data['user_id'],
        wpm=data['wpm'],
        accuracy=data['accuracy'],
        prompt_id=data['prompt_id'],
        run_time=data['run_time']
    )
    
    db.session.add(new_run)
    db.session.commit()
    
    return jsonify({
        'run_id': new_run.run_id,
        'user_id': new_run.user_id,
        'wpm': new_run.wpm,
        'accuracy': new_run.accuracy,
        'prompt_id': new_run.prompt_id,
        'run_time': new_run.run_time
    }), 201

if __name__ == "__main__":
    with app.app_context():  # Needed for DB operations
        db.create_all()      # Creates the database and tables