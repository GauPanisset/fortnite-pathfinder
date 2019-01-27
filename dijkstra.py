from collections import defaultdict, deque
import sys, json
from math import sqrt

class Graph(object):
    def __init__(self):
      self.nodes = set()
      self.edges = defaultdict(list)
      self.distances = {}

    def add_node(self, value):
      self.nodes.add(value)

    def remove_node(self, value):
      self.nodes.remove(value)

    def add_edge(self, from_node, to_node, distance):
      self.edges[from_node].append(to_node)
      self.edges[to_node].append(from_node)
      self.distances[(from_node, to_node)] = distance


def dijkstra(graph, initial):
    visited = {initial: 0}
    path = {}

    nodes = set(graph.nodes)

    while nodes:
      min_node = None
      for node in nodes:
        if node in visited:
          if min_node is None:
            min_node = node
          elif visited[node] < visited[min_node]:
            min_node = node
      if min_node is None:
        break

      nodes.remove(min_node)
      current_weight = visited[min_node]

      for edge in graph.edges[min_node]:
        try:
          weight = current_weight + graph.distances[(min_node, edge)]
        except:
          continue
        if edge not in visited or weight < visited[edge]:
          visited[edge] = weight
          path[edge] = min_node

    return visited, path

def shortest_path(graph, origin, destination, mode):
    res = []
    modes = {"solo": 1, "duo": 2, "squad": 4}
    for i in range(modes[mode]):
      visited, paths = dijkstra(graph, origin)
      full_path = deque()
      _destination = paths[destination]

      while _destination != origin:
        full_path.appendleft(_destination)
        _destination = paths[_destination]

      for node in full_path:
              graph.remove_node(node)

      full_path.appendleft(origin)
      full_path.append(destination)

      res.append(full_path)



    #return visited[destination], list(full_path)
    return list(res)



def distance(a, b, param):
    if b[4] == "bois":
      return (1/v)*sqrt((a[0]-b[0])**2+(a[1]-b[1])**2)+param["alpha"]*50+0.5*param["alphab"]*(b[2]-50) - param["betab"]*b[3]
    elif b[4] == "pierre":
      return (1/v)*sqrt((a[0]-b[0])**2+(a[1]-b[1])**2)+param["alpha"]*50+0.5*param["alphap"]*(b[2]-50) - param["betap"]*b[3]
    elif b[4] == "metal":
      return (1/v)*sqrt((a[0]-b[0])**2+(a[1]-b[1])**2)+param["alpha"]*50+0.5*param["alpham"]*(b[2]-50) - param["betam"]*b[3]
    else:
      return (1/v)*sqrt((a[0]-b[0])**2+(a[1]-b[1])**2)+param["alpha"]*50+0.5*param["alpha"]*(b[2]-50) - param["beta"]*b[3]      #Distance vers le dernier noeud

def read_in():
    lines = sys.stdin.readlines()
    return json.loads(lines[0])

def nodeToJSON(nodeList):
    res = []
    for node in nodeList:
        res.append({"x": node[0], "y": node[1]})
    return res

def inEllipse(node, a, b, c):       #a et b sont les foyers, c est tel que 2c >= aM + bM quelque soit M dans l'ellipse .
  return 2*c >= sqrt((node[0]-a[0])**2 + (node[1]-a[1])**2) + sqrt((node[0]-b[0])**2 + (node[1]-b[1])**2)

if __name__ == '__main__':
  v = 2.2

  time = []
  mats = []
  resPath = []
  param = {
    "alpha":0.0133,     #Default
    "beta":0.16,
    "alphab":0.0133,    #Bois
    "betab":0.16,
    "alphap":0.0133,    #Pierre
    "betap":0.16,
    "alpham":0.0133,    #Metal
    "betam":0.16,
  }

  [mode, debut, fin, positions] = read_in() #["solo", debut({"x":x,"y":y}), fin({"x":x,"y":y}), positions([{"x":x,"y":y,"vie":vie,"moyenne":moyenne,"variance":variance,"matiere":matiere},...])]

  debut = {"x":debut["x"],"y":debut["y"],"vie":0,"moyenne":0,"variance":0,"matiere":None}
  if not debut in positions:
    positions.append(debut)

  fin = {"x":fin["x"],"y":fin["y"],"vie":0,"moyenne":0,"variance":0,"matiere":None}
  if not fin in positions:
    positions.append(fin)

  graph = Graph()

  count = 0       #Nombre de noeuds dans le graphe utilisé par Dijkstra

  for n in positions:
    node = (n["x"], n["y"], n["vie"], n["moyenne"], n["matiere"])
    if inEllipse(node, (debut["x"], debut["y"]), (fin["x"], fin["y"]), sqrt((debut["x"] - fin["x"])**2 + (debut["y"] - fin["y"])**2)*0.8):
      graph.add_node(node)
      count += 1
    for n2 in positions:
      node2 = (n2["x"], n2["y"], n2["vie"], n2["moyenne"], n2["matiere"])
      dist1 = distance(node, node2, param)
      dist2 = distance(node2, node, param)
      if dist1 > 0:
        graph.add_edge(node, node2, dist1)
      if dist2 > 0:
        graph.add_edge(node2, node, dist2)

  myPath = shortest_path(graph, (debut["x"], debut["y"],0,0,None), (fin["x"], fin["y"],0,0,None), mode)
  for path in myPath:
    m = {"bois": 0, "pierre": 0, "metal": 0}
    t = 0
    for i in range(len(path)-1):
      t=t+(1/v)*sqrt((path[i+1][0]-path[i][0])**2+(path[i+1][1]-path[i][1])**2)+param["alpha"]*50+0.5*param["alpha"]*(path[i+1][2]-50)
      if path[i + 1][4] == "bois":
        m["bois"] += path[i+1][3]
      elif path[i + 1][4] == "pierre":
        m["pierre"] += path[i+1][3]
      elif path[i + 1][4] == "metal":
        m["metal"] += path[i+1][3]
    mats.append(m)
    time.append(t)
    resPath.append(nodeToJSON(path))



  t_min = (1/v)*sqrt((debut["x"]-fin["x"])**2+(debut["y"]-fin["y"])**2)


  print({"Temps min (s)": t_min,"Temps réel (s)": time,"Matériaux": mats, "count": count, "path": resPath})


