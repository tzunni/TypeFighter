import os
import random
import bcrypt  # Import bcrypt
from flask import Flask, jsonify, request, session
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DB_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define our database models
class Users(db.Model):
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Add autoincrement=True
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

class Stat_cache(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), primary_key=True)
    speed_mean = db.Column(db.Integer, nullable=False)
    accuracy_mean = db.Column(db.Integer, nullable=False)
    


@app.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    if not data or not all(key in data for key in ('user_name', 'email', 'password')):
        return jsonify({'error': 'Missing data'}), 400

    # Check if the email is already registered
    if Users.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400

    # Hash the password
    hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())

    new_user = Users(
        user_name=data['user_name'],
        pw_hash=hashed_password.decode('utf-8'),  # Store the hashed password as a string
        email=data['email']
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    if not data or not all(key in data for key in ('email', 'password')):
        return jsonify({'error': 'Missing data'}), 400

    user = Users.query.filter_by(email=data['email']).first()
    if user and bcrypt.checkpw(data['password'].encode('utf-8'), user.pw_hash.encode('utf-8')):  # Verify the hashed password
        session['user'] = {'user_id': user.user_id, 'username': user.user_name}
        return jsonify({'message': 'Login successful', 'username': user.user_name}), 200
    else:
        return jsonify({'error': 'Invalid email or password'}), 401

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
    
    new_stat_cache = Stat_cache(
        user_id=new_user.user_id,
        speed_mean=0,  # Default value
        accuracy_mean=0  # Default value
    )
    
    db.session.add(new_user)
    db.session.add(new_stat_cache)
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

@app.route('/random-prompt', methods=['GET'])
def get_random_prompt():
    try:
        # Get the total number of prompts
        total_prompts = Prompts.query.count()
        if total_prompts == 0:
            return jsonify({'error': 'No prompts available'}), 404

        # Select a random offset
        random_offset = random.randint(0, total_prompts - 1)

        # Fetch the random prompt
        random_prompt = Prompts.query.offset(random_offset).first()

        return jsonify({
            'id': random_prompt.id,
            'prompt': random_prompt.prompt,
            'difficulty': random_prompt.difficulty,
            'source': random_prompt.source
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/runs', methods=['POST'])
def create_run():
    try:
        data = request.get_json()
        if not data or not all(key in data for key in ('user_id', 'wpm', 'accuracy', 'prompt_id', 'run_time')):
            return jsonify({'error': 'Missing data'}), 400

        # Add the new run to the Runs table
        new_run = Runs(
            user_id=data['user_id'],
            wpm=data['wpm'],
            accuracy=data['accuracy'],
            prompt_id=data['prompt_id'],
            run_time=data['run_time']
        )
        db.session.add(new_run)
        db.session.commit()

        # Recalculate stats for the user
        recalculate_stats(data['user_id'])

        return jsonify({'message': 'Run uploaded successfully', 'run_id': new_run.run_id}), 201
    except Exception as e:
        # Log the error and return a JSON response
        print(f"Error in /runs: {e}")
        return jsonify({'error': str(e)}), 500


def recalculate_stats(user_id):
    # Fetch all runs for the user
    runs = Runs.query.filter_by(user_id=user_id).all()

    if not runs:
        return

    # Recalculate stats
    total_runs = len(runs)
    total_wpm = sum(run.wpm for run in runs)
    total_accuracy = sum(run.accuracy for run in runs)

    average_wpm = total_wpm // total_runs
    average_accuracy = total_accuracy // total_runs

    # Check if the user already has a row in stat_cache
    stat_cache_entry = Stat_cache.query.filter_by(user_id=user_id).first()

    if stat_cache_entry:
        # Update existing row
        stat_cache_entry.speed_mean = average_wpm
        stat_cache_entry.accuracy_mean = average_accuracy
    else:
        # Create a new row
        new_stat_cache_entry = Stat_cache(
            user_id=user_id,
            speed_mean=average_wpm,
            accuracy_mean=average_accuracy
        )
        db.session.add(new_stat_cache_entry)

    db.session.commit()

@app.route('/session', methods=['GET'])
def check_session():
    user = session.get('user')  # Check if user data exists in the session
    if user:
        return jsonify({
            'logged_in': True,
            'username': user['username'],
            'user_id': user['user_id']
        }), 200
    return jsonify({'logged_in': False}), 200

@app.route('/logout', methods=['POST'])
def logout_user():
    session.pop('user', None)  # Remove user data from the session
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/player-info/<int:user_id>', methods=['GET'])
def get_player_info(user_id):
    stat = Stat_cache.query.filter_by(user_id=user_id).first()
    if not stat:
        return jsonify({'error': 'Player stats not found'}), 404

    # Calculate rank based on speed_mean
    rank = Stat_cache.query.filter(Stat_cache.speed_mean > stat.speed_mean).count() + 1

    return jsonify({
        'username': session.get('user', {}).get('username', 'Guest'),
        'accuracy_mean': stat.accuracy_mean,
        'speed_mean': stat.speed_mean,
        'rank': rank
    }), 200

@app.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    try:
        # Fetch the top 3 players sorted by speed_mean in descending order
        top_players = Stat_cache.query.order_by(Stat_cache.speed_mean.desc()).limit(3).all()

        leaderboard = []
        for player in top_players:
            user = Users.query.filter_by(user_id=player.user_id).first()
            leaderboard.append({
                'username': user.user_name,
                'speed_mean': player.speed_mean,
                'accuracy_mean': player.accuracy_mean
            })

        return jsonify(leaderboard), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/boss', methods=['GET'])
def get_boss():
    boss = Boss.query.first()  # Assuming there's only one boss
    if boss:
        return jsonify({
            'boss_id': boss.boss_id,
            'boss_name': boss.boss_name,
            'current_hp': boss.current_hp,
            'max_hp': boss.max_hp,
            'img_location': boss.img_location,
            'dead': boss.dead
        }), 200
    else:
        return jsonify({'error': 'Boss not found'}), 404

@app.route('/boss/attack', methods=['POST'])
def attack_boss():
    data = request.get_json()
    damage = data.get('damage', 0)

    boss = Boss.query.first()
    if not boss:
        return jsonify({'error': 'Boss not found'}), 404

    boss.current_hp = max(0, boss.current_hp - damage)  # Reduce HP but not below 0
    if boss.current_hp == 0:
        boss.dead = True  # Mark the boss as dead

    db.session.commit()
    return jsonify({
        'boss_id': boss.boss_id,
        'current_hp': boss.current_hp,
        'dead': boss.dead
    }), 200

@app.route('/boss/reset', methods=['POST'])
def reset_boss():
    boss = Boss.query.first()
    if not boss:
        return jsonify({'error': 'Boss not found'}), 404

    boss.current_hp = boss.max_hp
    boss.dead = False
    db.session.commit()
    return jsonify({'message': 'Boss reset successfully'}), 200

if __name__ == "__main__":
    with app.app_context():  # Needed for DB operations
        db.create_all()      # Creates the database and tables