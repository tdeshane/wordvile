from flask import Flask, request, jsonify
from characters.silver import Silver

app = Flask(__name__)
silver = Silver()

@app.route('/silver/state', methods=['GET'])
def get_state():
    return jsonify({
        'name': silver.name,
        'title': silver.title,
        'state': silver.state,
        'appearance': silver.appearance,
        'description': silver.get_description()
    })

@app.route('/silver/absorb', methods=['POST'])
def absorb_emeralds():
    data = request.get_json()
    emeralds = data.get('emeralds', 0)
    result = silver.absorb_emeralds(emeralds)
    return jsonify(result)

@app.route('/silver/drain', methods=['POST'])
def drain_words():
    data = request.get_json()
    target_words = data.get('words', 0)
    result = silver.drain_words({'current_words': target_words})
    return jsonify(result)

@app.route('/silver/update_state', methods=['POST'])
def update_state():
    data = request.get_json()
    new_state = data.get('state', '')
    silver.update_state(new_state)
    return jsonify({'success': True, 'new_state': silver.state})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
