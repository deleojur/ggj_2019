using PhantomGrammar.BaseClasses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using UnityEngine;

namespace Assets.Utils
{
    public static class GraphicUtils
    {
        public static float inv255 = 1f / 255f;
        public static Color ToColor(this int color)
        {
            int r = (color >> 16) & 0xff;
            int g = (color >> 8) & 0xff;
            int b = color & 0xff;
            return new Color(r * inv255, g * inv255, b * inv255);
        }

        public static Color ToUnityColor(this PGColor color)
        {
            return new Color(color.R * inv255, color.G * inv255, color.B * inv255, color.A * inv255);
        }

        public static Color AddColor(Color color1, Color color2, float intensity)
        {
            return new Color(Mathf.Min(1f, color1.r + color2.r * intensity), Mathf.Min(1f, color1.g + color2.g * intensity), Mathf.Min(1f, color1.b + color2.b * intensity), color1.a);
        }

        public static Color MultiplyColor(Color color1, Color color2)
        {
            return new Color(color1.r * color2.r, color1.g * color2.g, color1.b * color2.b, color1.a * color2.a);
        }

        public static void RotateAndStretch(SpriteRenderer renderer, Vector3 a, Vector3 b, Camera camera)
        {
            Vector3 c = (a + b) * 0.5f;
            renderer.gameObject.transform.localPosition = a;
            a = renderer.gameObject.transform.position;
            renderer.gameObject.transform.localPosition = b;
            b = renderer.gameObject.transform.position;
            renderer.gameObject.transform.localPosition = c;
            Vector3 screenA = camera.WorldToScreenPoint(a);
            Vector3 screenB = camera.WorldToScreenPoint(b);
            c = new Vector3(a.x, a.y, b.z); // holds the z distance in the world;
            Vector3 screenC = camera.WorldToScreenPoint(c);

            //orientation
            Vector3 deltaScreen = screenB - screenA;
            float angle = Mathf.Rad2Deg * Mathf.Atan2(deltaScreen.y, deltaScreen.x);
            Quaternion q = Quaternion.Euler(0, 0, angle + 90);

            float screenAB = ((deltaScreen.x * deltaScreen.x) + (deltaScreen.y * deltaScreen.y));
            if (screenAB > 0)
                screenAB = Mathf.Sqrt(screenAB);
            deltaScreen = screenC - screenB;
            float screenBC = ((deltaScreen.x * deltaScreen.x) + (deltaScreen.y * deltaScreen.y));
            if (screenBC > 0)
                screenBC = Mathf.Sqrt(screenBC);

            //visual length
            Vector3 deltaWorld = b - a;
            float l = ((deltaWorld.x * deltaWorld.x) + (deltaWorld.y * deltaWorld.y));
            if (l > 0)
                l = Mathf.Sqrt(l);


            l *= renderer.sprite.pixelsPerUnit / renderer.sprite.rect.height;

            if (screenBC > 0)
                l *= screenAB / screenBC;


            renderer.gameObject.transform.localScale = new Vector3(1f, 1f * l, 1f);
            renderer.gameObject.transform.rotation = Camera.main.transform.rotation * q;
        }

        public static Color LerpColor(Color color1, Color color2, float f)
        {
            float a = Mathf.Lerp(color1.a, color2.a, f);
            float r = Mathf.Lerp(color1.r, color2.r, f);
            float g = Mathf.Lerp(color1.g, color2.g, f);
            float b = Mathf.Lerp(color1.b, color2.b, f);
            return new Color(r, g, b, a);
        }

        public static Color MultiplyColorForLight(Color color1, Color color2)
        {
            float brightness = (color2.r + color2.g + color2.b) * 0.33f;
            float invBrightness = 1f - brightness;
            //color2.r -= (0.3f) * invBrightness;
            //color2.g -= (0.3f) * invBrightness;
            //color2.b -= (0.3f) * invBrightness;
            //invBrightness = invBrightness * 0.75f + 0.25f;
            return new Color(Mathf.Lerp(color1.r * color2.r, color2.r * brightness, invBrightness) , Mathf.Lerp(color1.g * color2.g, color2.g * brightness, invBrightness), Mathf.Lerp(color1.b * color2.b, color2.b * brightness, invBrightness), color1.a * color2.a);
        }


        public static MeshRenderer AddPolygon(GameObject gameObject, Vector3[] vertices, Color color, Material material)
        {
            MeshFilter meshFilter = gameObject.AddComponent<MeshFilter>();
            MeshRenderer meshRenderer = gameObject.AddComponent<MeshRenderer>();

            meshFilter.mesh = CreateMesh(vertices);
            meshRenderer.material = material;
            meshRenderer.material.color = color;
            
            return meshRenderer;
        }

        

        

        public static Mesh CreateMesh(Vector3[] vertices)
        {
            int x; //Counter

            //Create a new mesh
            Mesh mesh = new Mesh();


            //UVs
            var uvs = new Vector2[vertices.Length];

            for (x = 0; x < vertices.Length; x++)
            {
                if ((x % 2) == 0)
                {
                    uvs[x] = new Vector2(0, 0);
                }
                else
                {
                    uvs[x] = new Vector2(1, 1);
                }
            }

            //Triangles
            int[] tris = new int[3 * (vertices.Length - 2)];    //3 verts per triangle * num triangles
            int C1 = 0;
            int C2 = 1;
            int C3 = 2;

            for (x = 0; x < tris.Length; x += 3)
            {
                tris[x] = C1;
                tris[x + 1] = C2;
                tris[x + 2] = C3;

                C2++;
                C3++;
            }

            //Assign data to mesh
            mesh.vertices = vertices;
            mesh.uv = uvs;
            mesh.triangles = tris;

            

            

            //Recalculations
            mesh.RecalculateNormals();
            mesh.RecalculateBounds();

            //Name the mesh
            mesh.name = "Polygon Mesh";

            //Return the mesh
            return mesh;
        }

        public static MeshRenderer AddMeshFromSource(GameObject gameObject, Color color, Material material, GameObject source)
        {
            MeshFilter meshFilter = gameObject.AddComponent<MeshFilter>();
            MeshRenderer meshRenderer = gameObject.AddComponent<MeshRenderer>();
            //Mesh sMesh = source.GetComponent<MeshFilter>().mesh;
            //Mesh mesh = new Mesh();
            //mesh.vertices = sMesh.vertices;
            //mesh.colors = sMesh.colors;
            //mesh.triangles = sMesh.triangles;

            meshFilter.mesh = source.GetComponent<MeshFilter>().sharedMesh;
            meshRenderer.material = material;
            meshRenderer.material.color = color;
            meshFilter.mesh.RecalculateNormals();
            meshFilter.mesh.RecalculateBounds();
            return meshRenderer;
        }

        public static MeshRenderer AddVoronoiPolygon(GameObject gameObject, Vector3[] vertices, Color color, Material material)
        {
            MeshFilter meshFilter = gameObject.AddComponent<MeshFilter>();
            MeshRenderer meshRenderer = gameObject.AddComponent<MeshRenderer>();

            meshFilter.mesh = CreateVoronoiMesh(vertices);
            meshRenderer.material = material;
            meshRenderer.material.color = color;
            meshFilter.mesh.RecalculateNormals();
            meshFilter.mesh.RecalculateBounds();
            return meshRenderer;
        }

        public static void SetVoronoiPolygon(GameObject gameObject, Vector3[] vertices)
        {
            MeshFilter meshFilter = gameObject.GetComponent<MeshFilter>();
            meshFilter.mesh = CreateVoronoiMesh(vertices);
            ;
        }

        public static Mesh CreateVoronoiMesh(Vector3[] vertices)
        {
            int x; //Counter

            //Create a new mesh
            Mesh mesh = new Mesh();


            //UVs
            var uvs = new Vector2[vertices.Length];

            for (x = 0; x < vertices.Length; x++)
            {
                if ((x % 2) == 0)
                {
                    uvs[x] = new Vector2(0, 0);
                }
                else
                {
                    uvs[x] = new Vector2(1, 1);
                }
            }

            //Triangles
            int[] tris = new int[3 * (vertices.Length-1)];    //3 verts per triangle * num triangles
            int C1 = 0;
            int C2 = 1;
            int C3 = 2;

            for (x = 0; x < tris.Length; x += 3)
            {
                tris[x] = C1;
                tris[x + 1] = C2;
                tris[x + 2] = C3;

                C2++;
                C3++;
                if (C3 >= vertices.Length)
                    C3 = 1;
            }

            //Assign data to mesh
            mesh.vertices = vertices;
            mesh.uv = uvs;
            mesh.triangles = tris;

            //Recalculations
            mesh.RecalculateNormals();
            mesh.RecalculateBounds();


            //Name the mesh
            mesh.name = "Voronoi Mesh";

            //Return the mesh
            return mesh;
        }
    }


    
}
