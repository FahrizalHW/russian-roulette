from flask import Flask, render_template, request, jsonify
import random

app = Flask(__name__)

players = []  
current_player = 0  
chamber = []  

def generate_chamber():
    """Buat revolver dengan 1 peluru di antara 6 slot"""
    new_chamber = [False] * 6
    bullet_position = random.randint(0, 5)
    new_chamber[bullet_position] = True
    return new_chamber

@app.route('/')
def index():
    """Tampilkan halaman utama"""
    return render_template('index.html')

@app.route('/start', methods=['POST'])
def start_game():
    """Mulai permainan dengan pemain yang dimasukkan"""
    global players, current_player, chamber
    players = request.json.get('players', [])
    current_player = 0
    chamber = generate_chamber()
    
    return jsonify({
        "status": "Game dimulai!",
        "current_player": players[current_player]
    })

@app.route('/shoot', methods=['POST'])
def shoot():
    """Menangani tembakan pemain"""
    global current_player, chamber

    if not chamber:
        chamber = generate_chamber()  

    shot = chamber.pop(0)  
    chamber.append(shot)   

    result = "safe" if not shot else "dead"
    player_name = players[current_player]

   
    if result == "safe":
        current_player = (current_player + 1) % len(players)

    return jsonify({
        "chamber": chamber,
        "status": result,
        "player": player_name,
        "next_player": players[current_player] if result == "safe" else None
    })

if __name__ == '__main__':
    app.run(debug=True)
