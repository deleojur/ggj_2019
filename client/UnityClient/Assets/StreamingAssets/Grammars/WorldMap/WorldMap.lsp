version: 0.6f
module:
name: "Start"
alphabet: "Alphabet"
position: (-106,50)
type: Recipe
match: None
grammar: true
recipe: true
showMembers: true

alphabet:
name: "Alphabet"
position: (-130,-50)

module:
name: "Enlarge"
alphabet: "Alphabet"
position: (-2,10)
type: Recipe
match: None
inputs: "Start"
grammar: true
recipe: true
showMembers: true

module:
name: "SeedTerrain"
alphabet: "Alphabet"
position: (130,-10)
type: Recipe
match: None
inputs: "Enlarge"
grammar: true
recipe: true
showMembers: true

module:
name: "SpawnPositions"
alphabet: "Alphabet"
position: (212,-20)
type: Recipe
match: None
inputs: "SeedTerrain"
grammar: true
recipe: true
showMembers: true

register: width 10
register: height 7
register: maxPlayers 4
register: players 4
