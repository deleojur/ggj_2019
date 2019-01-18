using UnityEngine;
using System.Collections;

namespace Entities
{
    public class PlayerHandler : MonoBehaviour
    {
        private string _name;
        private string _id;

        internal void Initialize(string name, string id)
        {
            _name = name;
            _id = id;
        }
    }
}
