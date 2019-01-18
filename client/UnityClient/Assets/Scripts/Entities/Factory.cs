using System;
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;
using Entities;

namespace Entities
{
    public class Factory : MonoBehaviour
    {
        private struct FactoryObjectType
        {
            public Transform parent { get; set; }
            public Stack<Transform> availableInactiveObjects { get; set; }
        };

        [SerializeField]
        [Tooltip("The amount of factory objects that are added when there aren't enough available when requested.")]
        private int _stepQuantity = 10;

        private Transform _objectParent = null;

        //a dictionary using hashcodes to add prefabs of a particular type to the factory.
        private Dictionary<string, FactoryObjectType> _factoryObjectTypes;

        //a dictionary assigning guid's to entities in order to retrieve them efficiently.
        private Dictionary<string, Entity> _entities;

        private void Awake()
        {
            _factoryObjectTypes = new Dictionary<string, FactoryObjectType>();
            _entities = new Dictionary<string, Entity>();
            _objectParent = transform;
        }

        public string GetGUIDByName(string name)
        {
            int index = name.IndexOf("@", 0, StringComparison.InvariantCulture) + 1;
            string guid = name.Substring(index, name.Length - index);
            return guid;
        }

        public bool TryGetEntityByGUID(string name, out Entity entity)
        {
            return _entities.TryGetValue(GetGUIDByName(name), out entity);
        }

        public void AllocateFactoryObjects(GameObject prefab, int quantity)
        {
            GenerateNewFactoryObjects(prefab, quantity);
        }

        private void AddEntityToDictionary(GameObject g_obj, string name)
        {
            string guid = GUID.Generate().ToString();
            g_obj.name = string.Format("{0}@{1}", name, guid);

            Entity entity = g_obj.GetComponent<Entity>();
            if (entity != null)
            {
                _entities.Add(guid, entity);
            }
        }

        private FactoryObjectType GenerateNewFactoryObjects(GameObject prefab, int quantity)
        {
            FactoryObjectType fot;
            if (!_factoryObjectTypes.TryGetValue(prefab.name, out fot))
            {
                fot = new FactoryObjectType();
                GameObject obj = new GameObject();
                obj.name = prefab.name;
                obj.transform.SetParent(_objectParent, true);
                fot.parent = obj.transform;

                fot.availableInactiveObjects = new Stack<Transform>();
                _factoryObjectTypes.Add(prefab.name, fot);
            }

            for (int i = 0; i < quantity; i++)
            {
                GameObject g_obj = GameObject.Instantiate(prefab);
                g_obj.SetActive(false);
                fot.availableInactiveObjects.Push(g_obj.transform);
                g_obj.transform.SetParent(fot.parent);

                AddEntityToDictionary(g_obj, prefab.name);
            }
            return fot;
        }

        /// <summary>
        /// Borrows a gameObject of a specific type.
        /// </summary>
        /// <returns>returns an empty object of the given prefab type.</returns>
        public Transform BorrowGameObject(GameObject prefab)
        {
            FactoryObjectType fot;
            if (_factoryObjectTypes.TryGetValue(prefab.name, out fot))
            {
                if (fot.availableInactiveObjects.Count < 1)
                {
                    GenerateNewFactoryObjects(prefab, _stepQuantity);
                }
            }
            else
            {
                fot = GenerateNewFactoryObjects(prefab, _stepQuantity);
            }

            Transform g_obj = fot.availableInactiveObjects.Pop();
            g_obj.gameObject.SetActive(true);
            return g_obj;
        }

        public void ReturnGameObject(Transform g_obj)
        {
            string name = g_obj.name;
            string type = name.Substring(0, name.IndexOf("@"));
            FactoryObjectType fot;
            if (_factoryObjectTypes.TryGetValue(type, out fot))
            {
                g_obj.gameObject.SetActive(false);
                fot.availableInactiveObjects.Push(g_obj);
                return;
            }
            throw new Exception(string.Format("Gameobject {0} cannot be found in the Factory.", g_obj.name));
        }
    }
};
