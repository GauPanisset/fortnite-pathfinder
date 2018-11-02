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

def shortest_path(graph, origin, destination):
    visited, paths = dijkstra(graph, origin)
    full_path = deque()
    _destination = paths[destination]

    while _destination != origin:
      full_path.appendleft(_destination)
      _destination = paths[_destination]

    full_path.appendleft(origin)
    full_path.append(destination)

    #return visited[destination], list(full_path)
    return list(full_path)


def distance(a, b):
    return 5*sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) - b[3]

def read_in():
    lines = sys.stdin.readlines()
    return json.loads(lines[0])

def nodeToJSON(nodeList):
    res = []
    for node in nodeList:
        res.append({"x": node[0], "y": node[1]})
    return res

if __name__ == '__main__':

  [debut, fin, positions] = read_in() #[debut({"x":x,"y":y}), fin({"x":x,"y":y}), positions([{"x":x,"y":y,"vie":vie,"moyenne":moyenne,"variance":variance,"matiere":matiere},...])]

  debut = {"x":debut["x"],"y":debut["y"],"vie":0,"moyenne":0,"variance":0,"matiere":None}
  if not debut in positions:
    positions.append(debut)

  fin = {"x":fin["x"],"y":fin["y"],"vie":0,"moyenne":0,"variance":0,"matiere":None}
  if not fin in positions:
    positions.append(fin)

  graph = Graph()

  for n in positions:
    node = (n["x"], n["y"], n["vie"], n["moyenne"])
    graph.add_node(node)
    for n2 in positions:
      node2 = (n2["x"], n2["y"], n2["vie"], n2["moyenne"])
      dist1 = distance(node, node2)
      dist2 = distance(node2, node)
      if dist1 > 0:
        graph.add_edge(node, node2, dist1)
      if dist2 > 0:
        graph.add_edge(node2, node, dist2)

  v = 2.2
  t_min = v*sqrt((debut["x"]-fin["x"])^2+(debut["y"]-fin["y"])^2)
  print({"Temps min (s)": t_min, "path": nodeToJSON(shortest_path(graph, (debut["x"], debut["y"],0,0), (fin["x"], fin["y"],0,0)))})

