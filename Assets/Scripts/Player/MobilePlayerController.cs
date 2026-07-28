using System.Collections;
using UnityEngine;
using UnityEngine.EventSystems;

[RequireComponent(typeof(CharacterController))]
public class MobilePlayerController : MonoBehaviour
{
    [Header("Jump")]
    [SerializeField] private float jumpHeight = 2.2f;
    [SerializeField] private float gravity = -22f;

    [Header("Slide")]
    [SerializeField] private float slideDuration = 0.7f;
    [SerializeField] private float standingHeight = 2f;
    [SerializeField] private float slidingHeight = 0.8f;

    [Header("Swipe")]
    [Tooltip("화면 높이에 대한 최소 스와이프 비율")]
    [Range(0.03f, 0.3f)]
    [SerializeField] private float minimumSwipeRatio = 0.08f;
    [SerializeField] private float maximumSwipeTime = 0.6f;

    [Header("Optional desktop test")]
    [SerializeField] private bool allowKeyboardInEditor = true;

    private CharacterController controller;
    private Transform visualRoot;
    private float verticalVelocity;
    private bool isSliding;

    private Vector2 touchStartPosition;
    private float touchStartTime;
    private int trackedFingerId = -1;
    private bool trackingTouch;

    private void Awake()
    {
        controller = GetComponent<CharacterController>();
        visualRoot = transform.Find("PlayerVisualRoot");

        controller.height = standingHeight;
        controller.center = new Vector3(0f, standingHeight * 0.5f, 0f);
    }

    private void Update()
    {
        UpdateVerticalMovement();
        ReadTouchInput();

#if UNITY_EDITOR || UNITY_STANDALONE
        if (allowKeyboardInEditor)
            ReadKeyboardInput();
#endif
    }

    private void UpdateVerticalMovement()
    {
        if (controller.isGrounded && verticalVelocity < 0f)
            verticalVelocity = -2f;

        verticalVelocity += gravity * Time.deltaTime;
        controller.Move(Vector3.up * verticalVelocity * Time.deltaTime);
    }

    private void ReadTouchInput()
    {
        if (Input.touchCount == 0)
        {
            trackingTouch = false;
            trackedFingerId = -1;
            return;
        }

        for (int i = 0; i < Input.touchCount; i++)
        {
            Touch touch = Input.GetTouch(i);

            // UI 버튼 터치는 스와이프로 중복 처리하지 않음
            if (touch.phase == TouchPhase.Began &&
                EventSystem.current != null &&
                EventSystem.current.IsPointerOverGameObject(touch.fingerId))
            {
                continue;
            }

            if (touch.phase == TouchPhase.Began && !trackingTouch)
            {
                trackingTouch = true;
                trackedFingerId = touch.fingerId;
                touchStartPosition = touch.position;
                touchStartTime = Time.unscaledTime;
                continue;
            }

            if (!trackingTouch || touch.fingerId != trackedFingerId)
                continue;

            if (touch.phase == TouchPhase.Ended || touch.phase == TouchPhase.Canceled)
            {
                float elapsed = Time.unscaledTime - touchStartTime;
                Vector2 delta = touch.position - touchStartPosition;
                float minimumDistance = Screen.height * minimumSwipeRatio;

                if (elapsed <= maximumSwipeTime &&
                    Mathf.Abs(delta.y) >= minimumDistance &&
                    Mathf.Abs(delta.y) > Mathf.Abs(delta.x))
                {
                    if (delta.y > 0f)
                        Jump();
                    else
                        Slide();
                }

                trackingTouch = false;
                trackedFingerId = -1;
            }
        }
    }

    private void ReadKeyboardInput()
    {
        if (Input.GetKeyDown(KeyCode.Space) || Input.GetKeyDown(KeyCode.UpArrow))
            Jump();

        if (Input.GetKeyDown(KeyCode.DownArrow) || Input.GetKeyDown(KeyCode.S))
            Slide();
    }

    public void Jump()
    {
        if (!controller.isGrounded || isSliding)
            return;

        verticalVelocity = Mathf.Sqrt(jumpHeight * -2f * gravity);
    }

    public void Slide()
    {
        if (!controller.isGrounded || isSliding)
            return;

        StartCoroutine(SlideRoutine());
    }

    private IEnumerator SlideRoutine()
    {
        isSliding = true;

        controller.height = slidingHeight;
        controller.center = new Vector3(0f, slidingHeight * 0.5f, 0f);

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
            GameManager.Instance?.GameOver();
    }
}
