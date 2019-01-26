#region License
/*
 * TestSocketIO.cs
 *
 * The MIT License
 *
 * Copyright (c) 2014 Fabio Panettieri
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
#endregion

using System.Collections;
using UnityEngine;
using SocketIO;
using System.Collections.Generic;

namespace Networking
{
    public class SocketManager : MonoBehaviour
    {
        [SerializeField]
        private SocketIOComponent _socket;

        internal SocketIOComponent Socket { get { return _socket; } }

        #region NetworkEvents
        internal delegate void MessageReceived<T>(T package) where T : NetworkPackage;

        internal static event MessageReceived<ConnectionPackage>    PlayerConnected;
        internal static event MessageReceived<NetworkPackage>       PlayerDisconnected;
        internal static event MessageReceived<PlayerInputPackage>   PlayerInputUpdated;
        #endregion

        private Queue<ConnectionPackage> _waitingPlayers = new Queue<ConnectionPackage>();

        public void Start()
        {
            _socket.On("open", ConnectionOpen);
            _socket.On("error", OnErrorReceived);
            _socket.On("close", OnConnectionClosed);

            _socket.On("join_game", OnPlayerConnected);
            _socket.On("exit_game", OnPlayerDisconnected);
            _socket.On("player_input", OnPlayerInputReceived);

            Main.OnGameRoundEnded += Main_OnGameRoundEnded;

            StartCoroutine(CreateGame());
        }

        private IEnumerator CreateGame()
        {
            yield return new WaitForSeconds(1);
            _socket.Emit("create_game");
        }

        internal void EmitMessage(string emissionName, JSONObject data)
        {
            _socket.Emit(emissionName, data);
        }

        private void OnPlayerInputReceived(SocketIOEvent e)
        {
            PlayerInputPackage p = new PlayerInputPackage(e);
            PlayerInputUpdated?.Invoke(p);
        }

        public void ConnectionOpen(SocketIOEvent e)
        {

        }

        private void Main_OnGameRoundEnded()
        {

        }

        public void OnPlayerDisconnected(SocketIOEvent e)
        {
            NetworkPackage p = new NetworkPackage(e);
            PlayerDisconnected?.Invoke(p);
        }

        public void OnPlayerConnected(SocketIOEvent e)
        {
            ConnectionPackage p = new ConnectionPackage(e);
            PlayerConnected?.Invoke(p);
        }

        public void OnErrorReceived(SocketIOEvent e)
        {

        }

        public void OnConnectionClosed(SocketIOEvent e)
        {

        }
    }
}