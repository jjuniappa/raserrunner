# Laser Runner Unity Mobile Starter

## 적용 내용
- 캐릭터 에셋 폴더:
  `Assets/Art/Characters/CharacterAssets`
- 캐릭터 에셋이 없을 때 큐브 블록으로 표시
- 환경은 흑백, 레이저만 빨간색
- 낮은 레이저는 점프, 높은 레이저는 슬라이딩으로 회피
- 시간이 지날수록 레이저 이동 속도 증가
- 시간이 지날수록 레이저 생성 간격 감소
- 모바일 스와이프 조작 지원
- 모바일 UI 버튼 연결용 스크립트 포함
- 노치/펀치홀 대응 Safe Area 스크립트 포함
- 60 FPS, 화면 꺼짐 방지, 가로 모드 초기 설정 포함

## 모바일 조작
- 위로 스와이프: 점프
- 아래로 스와이프: 슬라이딩
- 선택 사항:
  화면 버튼을 만들어 `MobileControlButtons.OnJumpPressed`,
  `MobileControlButtons.OnSlidePressed`에 연결할 수 있습니다.

## Unity 적용 순서
1. 새 Unity 3D 또는 URP 프로젝트를 만듭니다.
2. 압축을 풀고 내부 `Assets` 폴더를 Unity 프로젝트에 복사합니다.
3. Unity에서 `Laser` 태그를 생성합니다.
4. 빈 오브젝트를 만들고 `PrototypeSceneBuilder`를 추가합니다.
5. 흰색 또는 회색 환경 머티리얼과 빨간 레이저 머티리얼을 연결합니다.
6. 카메라는 플레이어 뒤쪽 사선 구도로 배치합니다.
7. Build Settings에서 Android 또는 iOS로 전환합니다.

## UI 버튼 추가
1. Canvas를 생성합니다.
2. Canvas Scaler:
   - UI Scale Mode: Scale With Screen Size
   - Reference Resolution: 1920 x 1080
   - Match: 0.5
3. Canvas 아래에 `SafeArea` 오브젝트를 만들고 `SafeAreaFitter`를 추가합니다.
4. SafeArea 아래에 점프/슬라이드 버튼을 배치합니다.
5. 빈 UI 컨트롤 오브젝트에 `MobileControlButtons`를 추가합니다.
6. Player의 `MobilePlayerController`를 player 필드에 연결합니다.
7. 버튼 OnClick:
   - 점프: OnJumpPressed
   - 슬라이드: OnSlidePressed

## Android 권장 설정
- Orientation: Landscape Left / Right
- Scripting Backend: IL2CPP
- Target Architectures: ARM64
- Minimum API Level은 프로젝트 요구사항에 맞게 지정
- Optimized Frame Pacing 활성화 권장

## iOS 권장 설정
- Target Device: iPhone + iPad
- Architecture: ARM64
- Requires Fullscreen은 게임 구성에 따라 선택
- Landscape Left / Right 활성화

## 캐릭터 에셋 교체
1. 캐릭터 파일을 `Assets/Art/Characters/CharacterAssets`에 넣습니다.
2. 캐릭터 프리팹을 `PlayerVisualRoot` 아래에 배치합니다.
3. `PlaceholderBlock`을 비활성화합니다.
4. 발 위치와 캐릭터 크기를 조정합니다.

## 에디터 테스트
- Space 또는 위 방향키: 점프
- 아래 방향키 또는 S: 슬라이딩
