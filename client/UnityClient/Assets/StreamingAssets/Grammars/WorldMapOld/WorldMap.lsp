version: 0.6f
alphabet:
name: "Map"
position: (-145,-115)

module:
name: "GenerateVoronoi"
alphabet: "Map"
position: (-264,9)
type: Recipe
match: None
inputs: "CheckDistance"
grammar: true
recipe: true
showMembers: true
alwaysStartWithToken: true

module:
name: "BaseStructure"
alphabet: "Map"
position: (-145,92)
type: Recipe
match: None
inputs: "GenerateVoronoi"
grammar: true
recipe: true
showMembers: true

check:
name: "CheckDistance"
position: (-83,-23)
inputs: "BaseStructure"
heuristic: questDistance>=7
outputs: "Converge": result==false, "GenerateVoronoi": , "FinalMap": result==true

module:
name: "FinalMap"
alphabet: "Map"
position: (67,16)
type: Recipe
match: None
inputs: "CheckDistance"
grammar: true
executionType: LSystem
recipe: true
showMembers: true

register: questDistance 9
register: areaID 115
register: areaSize 1
register: sites 2
register: metal 1
register: water 1
register: wood 1
register: fire 0
register: earth 1
register: destination "tree"
register: region "swamp"
register: guardian "champion"
register: task "burry"
register: used ["swamp", "forest", "hill", "mountain"]
register: goalArea 108
register: plains 5
register: forests 4
register: complexity 5
register: requires ["GetRareWoodSigil", "ComplicationTime", "GetBaneSword"]
register: riverID 106
register: currentRiverID 103
option: Node "undefined"
option: Edge "edge"
option: Count 30
option: Width 400
option: Height 400
option: Relax 2
option: Start "mountain"
option: Member "id"
option: MemberRenamed "distanceToMountains"
option: Find "*(children&='weird')"
option: Replace "*(children-='weird')"
option: Register "requires"
option: Filter "areaID"
option: AddMembers false
