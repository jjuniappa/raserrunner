using System.Collections;
using UnityEngine;

[RequireComponent(typeof(CharacterController))]
public class PlayerController : MonoBehaviour
{
    [Header("Jump")]
    [SerializeField] private float jumpHeight = 2.2f;
    [SerializeField] private float gravity = -22f;

    [Header("Slide")]
    [SerializeField] private float slideDuration = 0.7f;
    [SerializeField] private float standingHeight = 2f;
    [SerializeField] private float slidingHeight = 0.8f;

    private CharacterController controller;
    private float verticalVelocity;
    private bool isSliding;

    private void Awake()
    {
        controller = GetComponent<CharacterController>();
        controller.height = standingHeight;
    }

    private void Update()
    {
        if (controller.isGrounded && verticalVelocity < 0f)
            verticalVelocity = -2f;

        if ((Input.GetKeyDown(KeyCode.Space) || Input.GetKeyDown(KeyCode.UpArrow)) &&
            controller.isGrounded && !isSliding)
        {
            verticalVelocity = Mathf.Sqrt(jumpHeight * -2f * gravity);
        }

        if ((Input.GetKeyDown(KeyCode.DownArrow) || Input.GetKeyDown(KeyCode.S)) &&
            controller.isGrounded && !isSliding)
        {
            StartCoroutine(Slide());
        }

        verticalVelocity += gravity * Time.deltaTime;
        controller.Move(Vector3.up * verticalVelocity * Time.deltaTime);
    }

    private IEnumerator Slide()
    {
        isSliding = true;

        controller.height = slidingHeight;
        controller.center = new Vector3(0f, slidingHeight * 0.5f, 0f);

        Transform visualRoot = transform.Find("PlayerVisualRoot");
        if (visualRoot != null)
        {
            visualRoot.localScale = new Vector3(1f, 0.42f, 1f);
            visualRoot.localPosition = new Vector3(0f, slidingHeight * 0.5f, 0f);
        }

        yield return new WaitForSeconds(slideDuration);

        controller.height = standingHeight;
        controller.center = new Vector3(0f, standingHeight * 0.5f, 0f);

        if (visualRoot != null)
        {
            visualRoot.localScale = Vector3.one;
            visualRoot.localPosition = new Vector3(0f, standingHeight * 0.5f, 0f);
        }

        isSliding = false;
    }

    private void OnControllerColliderHit(ControllerColliderHit hit)
    {
        if (hit.collider.CompareTag("Laser"))
        {
            Debug.Log("Game Over");
            Time.timeScale = 0f;
        }
    }
}
