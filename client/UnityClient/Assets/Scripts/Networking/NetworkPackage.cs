using System;
using System.Collections.Generic;
using SocketIO;

namespace Networking
{
    internal class NetworkPackage
    {
        internal NetworkPackage(SocketIOEvent e)
        {
            e.data.GetField(ref sender, "id");
        }
        internal string sender;
    }

    internal class ConnectionPackage : NetworkPackage
    {
        internal ConnectionPackage(SocketIOEvent e) : base(e)
        {
            e.data.GetField(ref name, "name");
        }
        internal string name;
    }

    internal class PlayerInputPackage : NetworkPackage
    {
        internal PlayerInputPackage(SocketIOEvent e) : base(e)
        {
            e.data.GetField(ref x, "x");
            e.data.GetField(ref y, "y");
            e.data.GetField(ref z, "z");
            e.data.GetField(ref alpha, "alpha");
            e.data.GetField(ref beta, "beta");
            e.data.GetField(ref gamma, "gamma");
            e.data.GetField(ref shooting, "shooting");
            e.data.GetField(ref moving, "moving");
        }
        internal float x, y, z;
        internal float alpha, beta, gamma;
        internal bool shooting, moving;
    }
}
