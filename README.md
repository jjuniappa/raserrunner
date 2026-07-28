# Laser Runner — GitHub Pages Web Game

이 폴더의 파일을 GitHub 저장소 루트에 업로드하고 GitHub Pages를 활성화하면,
생성된 링크를 모바일 브라우저에서 열어 바로 플레이할 수 있습니다.

## 포함 기능

- 모바일 브라우저에서 바로 실행
- 별도 설치 및 Unity 불필요
- 플레이어는 임시 검은 블록
- 캐릭터 에셋용 `assets/characters` 폴더
- 레이저만 빨간색
- 낮은 레이저: 점프
- 높은 레이저: 슬라이딩
- 위/아래 스와이프
- JUMP / SLIDE 화면 버튼
- 시간이 지날수록 레이저 속도 증가
- 시간이 지날수록 생성 간격 감소
- 최고 점수 로컬 저장
- 모바일 Safe Area 대응
- 기본 PWA/오프라인 캐시 지원

## GitHub 업로드 및 실행 링크 만들기

1. GitHub에서 새 저장소를 만듭니다.
2. 이 ZIP의 압축을 풉니다.
3. 압축을 푼 폴더 안의 모든 파일을 저장소 루트에 업로드합니다.
   - `index.html`
   - `style.css`
   - `game.js`
   - `manifest.webmanifest`
   - `service-worker.js`
   - `assets` 폴더
4. 저장소의 `Settings`로 이동합니다.
5. 왼쪽 메뉴에서 `Pages`를 선택합니다.
6. `Build and deployment`에서:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
7. `Save`를 누릅니다.
8. 잠시 기다리면 아래 형식의 주소가 생성됩니다.

   `https://사용자이름.github.io/저장소이름/`

9. 해당 주소를 모바일 브라우저에서 열면 게임이 실행됩니다.

## 캐릭터 교체 준비

캐릭터 파일은 다음 폴더에 넣습니다.

`assets/characters/`

현재 게임은 Canvas에서 검은 블록을 직접 그립니다.
이미지 또는 스프라이트 캐릭터를 올린 뒤 `game.js`의 `drawPlayer()`를 수정하면 교체할 수 있습니다.

## 로컬 테스트

보안 정책 때문에 HTML 파일을 직접 더블클릭하는 것보다 로컬 서버로 실행하는 편이 좋습니다.

Python이 있다면:

```bash
python -m http.server 8000
```

브라우저에서:

`http://localhost:8000`

## 조작

- 위로 스와이프: 점프
- 아래로 스와이프: 슬라이딩
- 데스크톱 테스트:
  - Space / 위 방향키: 점프
  - 아래 방향키 / S: 슬라이딩
