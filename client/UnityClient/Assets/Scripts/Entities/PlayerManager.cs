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
        private GameObject _clientHandler;

        [SerializeField]
        private Factory _factory;

        private Dictionary<string, PlayerHandler> _clients;

        // Use this for initialization
        private void Start()
        {
            _clients = new Dictionary<string, PlayerHandler>();
            SocketManager.PlayerInputUpdated += SocketManager_PlayerInputUpdated;
            SocketManager.PlayerConnected += SocketManager_PlayerConnected;
            SocketManager.PlayerDisconnected += SocketManager_PlayerDisconnected;
        }

        private void SocketManager_PlayerConnected(ConnectionPackage package)
        {
            Transform t = _factory.BorrowGameObject(_clientHandler);
            PlayerHandler p = t.gameObject.GetComponent<PlayerHandler>();
            p.Initialize(package.name, package.sender);
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
            PlayerHandler client;
            if (_clients.TryGetValue(package.sender, out client))
            {
                client.UpdateRotation(package.beta);
                if (package.shooting)
                {
                    client.Shoot();
                }
                if (package.moving)
                {
                    client.MoveForward();
                }
                /*Vector3 direction = new Vector3(package.y, 0, package.y);
                if (Vector3.SqrMagnitude(direction) > 1)
                    client.UpdatePosition(direction.normalized * .01f);*/
            }
        }
    }
}
