using UnityEngine;
using System.Collections;
using Networking;
using System.Collections.Generic;
using InControl;

namespace Entities
{
    public class PlayerManager : MonoBehaviour
    {
        [SerializeField]
        private GameObject _playerPrefab;

        [SerializeField]
        private Factory _factory;

        [SerializeField]
        private Color[] _colors;

        private Dictionary<string, PlayerController> _clients;

        // Use this for initialization
        private void Start()
        {
            _clients = new Dictionary<string, PlayerController>();
            SocketManager.PlayerInputUpdated += SocketManager_PlayerInputUpdated;
            SocketManager.PlayerConnected += SocketManager_PlayerConnected;
            SocketManager.PlayerDisconnected += SocketManager_PlayerDisconnected;
        }

        private void SocketManager_PlayerConnected(ConnectionPackage package)
        {
            Transform t = _factory.BorrowGameObject(_playerPrefab);
            PlayerController p = t.gameObject.GetComponentInChildren<PlayerController>();
            p.Color = _colors[_clients.Count];
            _clients.Add(package.sender, p);
        }

        private void SocketManager_PlayerDisconnected(NetworkPackage package)
        {
            if (_clients.ContainsKey(package.sender))
            {
                _factory.ReturnGameObject(_clients[package.sender].transform);
                _clients.Remove(package.sender);
            }
        }

        private void SocketManager_PlayerInputUpdated(PlayerInputPackage package)
        {
            PlayerController player;
            if (_clients.TryGetValue(package.sender, out player))
            {
                if (package.shooting)
                {
                    player.Fire();
                }
                if (package.moving)
                {
                    player.Move();
                }
                player.Turn(package.beta);
            }
        }
    }
}
