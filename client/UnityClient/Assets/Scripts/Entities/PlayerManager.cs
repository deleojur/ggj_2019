using UnityEngine;
using System.Collections;
using Networking;
using System.Collections.Generic;
using InControl;

namespace Entities
{
    public class PlayerManager : MonoBehaviour
    {
        internal struct DebugKeys
        {
            public KeyCode Forward, Shoot, MoveLeft, MoveRight;
        };

        [SerializeField]
        private SocketManager _socketManager;

        [SerializeField]
        private GameObject _playerPrefab;

        [SerializeField]
        private Factory _factory;

        [SerializeField]
        internal Color[] _colors;

        private Dictionary<string, PlayerController> _clients;
        public int PlayerAmount { get { return _clients.Count; } }
        public PlayerController GetPlayer(Color color)
        {
            foreach(KeyValuePair<string, PlayerController> client in _clients)
                if (client.Value.Color == color)
                    return client.Value;
            return null;
        }

        private DebugKeys[] _debugKeys = new DebugKeys[2]
        {
            new DebugKeys{Forward = KeyCode.W, Shoot = KeyCode.Q, MoveLeft = KeyCode.A, MoveRight = KeyCode.D},
            new DebugKeys{Forward = KeyCode.UpArrow, Shoot = KeyCode.RightShift, MoveLeft = KeyCode.LeftArrow, MoveRight = KeyCode.RightArrow}
        };

        // Use this for initialization
        private void Start()
        {
            _clients = new Dictionary<string, PlayerController>();
            SocketManager.PlayerInputUpdated += SocketManager_PlayerInputUpdated;
            SocketManager.PlayerConnected += SocketManager_PlayerConnected;
            SocketManager.PlayerDisconnected += SocketManager_PlayerDisconnected;
        }

        private int _debugIndex = 0;
        private void Update()
        {
            if (Input.GetKeyDown(KeyCode.Space))
            {
                if (_debugIndex < _debugKeys.Length)
                {
                    Transform t = _factory.BorrowGameObject(_playerPrefab);
                    PlayerController p = t.gameObject.GetComponentInChildren<PlayerController>();
                    p.ActivateDebugMode(_debugKeys[_debugIndex++]);
                    p.Color = _colors[_clients.Count];
                    _clients.Add(string.Format("debug_tank_{0}", _debugIndex), p);
                    p.gameObject.SetActive(false);
                    Main.Instance.PlayerJoined();
                }
            }
        }

        private void SocketManager_PlayerConnected(ConnectionPackage package)
        {
            Debug.LogError("connection");
            Transform t = _factory.BorrowGameObject(_playerPrefab);
            PlayerController p = t.gameObject.GetComponentInChildren<PlayerController>();

            p.Color = _colors[_clients.Count];
            _clients.Add(package.sender, p);
            p.gameObject.SetActive(false);
            Main.Instance.PlayerJoined();
        }

        private void SocketManager_PlayerDisconnected(NetworkPackage package)
        {
            if (_clients.ContainsKey(package.sender))
            {
                _factory.ReturnGameObject(_clients[package.sender].transform);
                _clients.Remove(package.sender);
                Main.Instance.PlayerJoined();
            }
        }

        internal void RemoveAllClients()
        {
            _debugIndex = 0;
            _clients.Clear();
        }

        internal void RemoveClient(PlayerController remove)
        {
            foreach(KeyValuePair<string, PlayerController> client in _clients)
            {
                if (client.Value == remove)
                    _clients.Remove(client.Key);
            }
        }

        internal void ActivateClients()
        {
            foreach(KeyValuePair<string, PlayerController> client in _clients)
            {
                client.Value.gameObject.SetActive(true);
                client.Value.gameObject.transform.position = Main.Instance.worldManager.worldMap.spawnLocation;
            }
        }

        private void SocketManager_PlayerInputUpdated(PlayerInputPackage package)
        {
            PlayerController player;
            if (_clients.TryGetValue(package.sender, out player))
            {
                player.SetPackageInfo(package);
            }
        }
    }
}
