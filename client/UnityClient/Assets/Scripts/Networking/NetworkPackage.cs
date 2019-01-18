using System;
using System.Collections.Generic;

namespace Networking
{
    internal class NetworkPackage
    {
        internal string sender;
    }

    internal class ConnectionPackage : NetworkPackage
    {
        internal string name;
    }
}
