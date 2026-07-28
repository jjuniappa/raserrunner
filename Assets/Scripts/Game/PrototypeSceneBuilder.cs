using UnityEngine;

public class PrototypeSceneBuilder : MonoBehaviour
{
    [Header("Optional materials")]
    [SerializeField] private Material environmentMaterial;
    [SerializeField] private Material redLaserMaterial;

    private void Start()
    {
        CreateFloor();
        CreatePlayerPlaceholder();
        CreateLaserPrefabExample();
    }

    private void CreateFloor()
    {
        GameObject floor = GameObject.CreatePrimitive(PrimitiveType.Cube);
        floor.name = "MovingWalkway";
        floor.transform.position = new Vector3(0f, -0.15f, 4f);
        floor.transform.localScale = new Vector3(6f, 0.3f, 20f);

        if (environmentMaterial != null)
            floor.GetComponent<Renderer>().material = environmentMaterial;
    }

    private void CreatePlayerPlaceholder()
    {
        GameObject player = new GameObject("Player");
        player.transform.position = Vector3.zero;

        CharacterController controller = player.AddComponent<CharacterController>();
        controller.height = 2f;
        controller.radius = 0.4f;
        controller.center = new Vector3(0f, 1f, 0f);

        player.AddComponent<PlayerController>();

        GameObject visualRoot = new GameObject("PlayerVisualRoot");
        visualRoot.transform.SetParent(player.transform);
        visualRoot.transform.localPosition = new Vector3(0f, 1f, 0f);

        GameObject block = GameObject.CreatePrimitive(PrimitiveType.Cube);
        block.name = "PlaceholderBlock";
        block.transform.SetParent(visualRoot.transform);
        block.transform.localPosition = Vector3.zero;
        block.transform.localScale = new Vector3(0.8f, 2f, 0.8f);

        if (environmentMaterial != null)
            block.GetComponent<Renderer>().material = environmentMaterial;
    }

    private void CreateLaserPrefabExample()
    {
        GameObject laser = GameObject.CreatePrimitive(PrimitiveType.Cube);
        laser.name = "LaserExample_RED";
        laser.transform.position = new Vector3(5f, 0.55f, 3f);
        laser.transform.localScale = new Vector3(8f, 0.12f, 0.12f);
        laser.tag = "Laser";
        laser.AddComponent<LaserObstacle>();

        if (redLaserMaterial != null)
            laser.GetComponent<Renderer>().material = redLaserMaterial;
        else
            laser.GetComponent<Renderer>().material.color = Color.red;
    }
}
