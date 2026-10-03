# Handoff: AI Desktop Companion cho Windows

## Mục đích tài liệu

Tài liệu này chuyển toàn bộ bối cảnh của cuộc trao đổi sang một project Codex khác. Project đích là một ứng dụng Windows mới thuộc hệ sinh thái `mstore`; repository hiện tại `ecommerce-backend` chỉ đang được dùng để lưu tài liệu handoff và không phải nơi triển khai ứng dụng.

## Tầm nhìn sản phẩm

Xây dựng một ứng dụng Windows dạng **AI desktop companion** kết hợp ba vai trò:

1. **Pet/waifu trên desktop**: nhân vật hoạt hình luôn hiện trên màn hình, có thể kéo, chạm, tương tác và phản hồi trạng thái.
2. **Nút điều hướng nổi**: khi bấm vào pet hoặc nút tròn, mở menu thao tác nhanh tương tự AssistiveTouch trên iPhone.
3. **Trợ lý AI mở rộng được**: người dùng có thể chọn hoặc thêm model AI và bổ sung chức năng như chat, dịch, phát hiện ngôn ngữ, đọc văn bản, nhận giọng nói, tóm tắt và các thao tác Windows được cho phép.

Ứng dụng hướng tới Microsoft Store, local-first, hoạt động hữu ích khi offline và có thể dùng dịch vụ AI cloud khi người dùng chủ động cấu hình.

## Trải nghiệm mong muốn

- Pet/waifu là một cửa sổ trong suốt, không viền, luôn nổi trên các cửa sổ khác.
- Người dùng có thể kéo pet đến vị trí bất kỳ và thay đổi kích thước.
- Bấm pet mở một menu nhanh dạng vòng tròn hoặc fan menu quanh nhân vật.
- Menu ban đầu có các hành động: Chat, Dịch, Đọc văn bản, Chụp vùng màn hình, Mở ứng dụng và Cài đặt.
- Khi người dùng chọn văn bản trong một ứng dụng, companion có thể hiện một nút nhỏ cạnh con trỏ để dịch, viết lại hoặc soạn câu trả lời.
- Kết quả AI xuất hiện trong speech bubble hoặc panel gọn cạnh pet.
- Pet có trạng thái và animation tương ứng: idle, listening, thinking, working, success, error và waiting-for-user.
- Có thể đổi nhân vật, persona, giọng nói, model AI và ngôn ngữ giao diện ngay lập tức mà không khởi động lại ứng dụng.
- Các quyền nhạy cảm như chụp màn hình, micro hoặc tự động hóa phải được giải thích rõ và chỉ dùng khi chức năng tương ứng được kích hoạt.

## Phạm vi MVP đề xuất

### Shell và pet

- WinUI 3 transparent always-on-top companion window.
- Kéo thả, snap cạnh màn hình, lưu vị trí theo từng màn hình và DPI.
- Một pet mặc định có đầy đủ các trạng thái animation cần thiết.
- Click-through khi pet ở chế độ thụ động; nhận pointer input khi người dùng tương tác.
- System tray để mở lại, ẩn pet, mở cài đặt và thoát.

### Menu thao tác nhanh

- Radial/fan menu có thể dùng hoàn toàn bằng chuột, bàn phím và screen reader.
- Danh sách action đến từ registry qua dependency injection để tính năng mới có thể tự đăng ký.
- Cho phép sắp xếp, bật/tắt và gán phím tắt cho action.
- Có command palette làm phương án truy cập bằng bàn phím.

### AI và ngôn ngữ

- Chat với model local hoặc endpoint tương thích OpenAI do người dùng cấu hình.
- Dịch văn bản thủ công từ clipboard hoặc vùng văn bản người dùng chọn.
- Tự phát hiện ngôn ngữ và chọn ngôn ngữ đích.
- Streaming kết quả, hỗ trợ hủy yêu cầu và timeout có cấu hình.
- Persona riêng cho pet, tách khỏi prompt chức năng như dịch hoặc tóm tắt.
- Lịch sử và thiết lập lưu cục bộ; người dùng có thể xóa hoặc xuất dữ liệu.

### Mở rộng tính năng

- Hợp đồng extension ở mức source/package đã kiểm soát, tránh Reflection và runtime code generation.
- Mỗi feature triển khai qua interface rõ ràng, ví dụ action, AI provider, translator, speech-to-text và text-to-speech.
- Các feature đăng ký tại Composition Root bằng constructor injection.
- Nếu phát hành extension bên thứ ba về sau, dùng manifest và catalog được tạo lúc build bằng source generator thay vì nạp assembly tùy ý lúc chạy.

## Kiến trúc bắt buộc

Vai trò kỹ thuật của task mới: CTO, Chief Architect và .NET Principal Engineer cho hệ sinh thái `mstore`.

- Ngôn ngữ và runtime: **C# 14, .NET 10**.
- UI: **WinUI 3, Windows App SDK**.
- Đóng gói: **WAP/MSIX**, phát hành Microsoft Store.
- Local-first, hoạt động offline với dữ liệu và tính năng cốt lõi.
- Tìm và tái sử dụng `core` trước khi tạo abstraction hoặc implementation mới. `core` sở hữu MVVM, commands, result types, logging, live settings, localization JSON AOT, themes, UI, navigation, billing, Store, config và I/O helpers.
- ViewModel sở hữu state và commands. Code-behind chỉ dùng cho window handle, focus, drag/drop và UI interop.
- XAML dùng typed `{x:Bind}` với `Mode` rõ ràng và `x:DataType`. Không dùng `{Binding}` hoặc converter khi có thể dùng hàm x:Bind hay property trên ViewModel.
- UI phải hỗ trợ high contrast, bàn phím, screen reader, layout responsive và scaling 200%.
- Localization dùng `System.Text.Json` SourceGen, file fallback `Locales/en-US.json`, stable keys và câu đầy đủ. Giao diện đổi ngôn ngữ ngay qua weak event/signal, không cần mở lại màn hình hay restart.
- Settings dùng `AppSettings` strongly typed và observable trong LocalAppData; ghi atomic bằng temp + move/replace, có debounce và live-apply, không có nút Save.
- Async API nhận `CancellationToken`, không chặn UI thread, không dùng `.Result`, `.Wait()`, `Thread.Sleep()` hoặc sync I/O/process.
- Native AOT zero-warning ready; dùng CommunityToolkit.Mvvm partial properties với `[ObservableProperty]` và System.Text.Json SourceGen.
- Dùng `Task` mặc định; chỉ dùng `Span` hoặc `ValueTask` khi có số đo chứng minh cần thiết.
- Dispose toàn bộ `IDisposable`.
- `StoreContext` phải nằm sau abstraction của core; manifest dùng least privilege; dữ liệu mutable của người dùng phải tồn tại qua app update.
- Không dùng `dynamic`, Reflection, runtime code generation hoặc Newtonsoft.Json.
- Không hardcode user-facing text, đường dẫn máy, Store/product ID, URL, secret hay giới hạn. Tất cả đi qua localization, config hoặc typed options phù hợp.
- Không dùng Service Locator hoặc global singleton. Đăng ký dependency tại Composition Root và constructor injection.
- Không cấp entitlement billing giả trong production.
- Không sửa `.slnx`, WAP/MSIX, Package Identity, Publisher, Platform hoặc Store association nếu người dùng chưa yêu cầu rõ.
- Mọi implementation phải hoàn chỉnh, không để placeholder, nhánh logic chưa xử lý hoặc exception cố ý chưa triển khai.

## Phân tách module đề xuất

```text
mstore.Companion.App
  Composition Root, WinUI windows, lifecycle, activation, tray integration

mstore.Companion.Core
  Shared mstore core contracts and reusable infrastructure

mstore.Companion.Pet
  Pet state machine, animation contract, positioning, DPI and display behavior

mstore.Companion.Actions
  Action registry, radial menu model, command palette and built-in actions

mstore.Companion.AI
  Provider contracts, streaming chat, tool routing, model profiles and policy

mstore.Companion.Language
  Detection, translation, rewriting, locale selection and text pipelines

mstore.Companion.Speech
  Speech-to-text, text-to-speech, audio lifecycle and cancellation

mstore.Companion.Automation
  Explicitly allowed Windows actions with audit trail and permission boundaries

mstore.Companion.Settings
  Strongly typed live settings and atomic persistence

mstore.Companion.Localization
  AOT JSON localization, fallback and live refresh

mstore.Companion.Store
  Store abstractions, licensing and billing integration
```

Tên project thực tế phải theo convention đã có trong repository đích. Không tạo các project trên nếu `core` hoặc solution hiện hữu đã cung cấp cùng trách nhiệm.

## Nguyên tắc tích hợp model AI

C# là lớp ứng dụng và orchestration; model AI không cần được viết bằng C#. Thiết kế provider nên hỗ trợ:

- Model local thông qua engine hoặc local endpoint được cấu hình.
- Endpoint cloud tương thích OpenAI khi người dùng cung cấp credential.
- Provider chuyên dụng cho dịch, STT và TTS nếu cần.
- Chọn model riêng theo capability thay vì buộc một model làm mọi việc.
- Capability discovery: streaming, vision, tools, structured output, context size và offline availability.
- Credential lưu bằng cơ chế bảo mật phù hợp của Windows; tuyệt đối không ghi secret vào JSON settings hoặc log.
- Prompt dịch và prompt persona là hai pipeline riêng để tính cách của waifu không làm sai bản dịch.
- Tool execution phải dùng allow-list, typed arguments, xác nhận ở UI cho hành động có tác động lớn và ghi audit cục bộ.

## Các sản phẩm/dự án đã khảo sát

### Gần nhất với nền tảng C# mở rộng được

**VPet Simulator**  
Repository: <https://github.com/LorisYounger/VPet>

- Open source, desktop pet viết bằng WPF/C#.
- Có toolbar khi bấm nhân vật.
- Core có thể nhúng vào ứng dụng WPF.
- Hỗ trợ code plugin để thêm animation logic và chức năng như alarm hoặc notepad.
- Có Steam Workshop và hệ sinh thái mod.
- Đây là nguồn tham khảo tốt cho state machine, animation và plugin model, nhưng sản phẩm mới phải theo WinUI 3/.NET 10 và các quy tắc AOT ở trên.

**VPet plugin examples**  
Repository: <https://github.com/LorisYounger/VPet.Plugin.Demo>

- Có ví dụ plugin đồng hồ/Pomodoro.
- Có ví dụ ChatGPT-format API.
- Có Edge TTS.
- Hữu ích để nghiên cứu extension surface và UX, không sao chép kiến trúc nếu xung đột với core, AOT hoặc dependency injection của `mstore`.

**VPet.Plugin.Claude**  
Repository: <https://github.com/JayQuan-McCleary/VPet.Plugin.Claude>

- Hỗ trợ Claude, OpenAI-compatible, Gemini, Groq, Ollama và LM Studio.
- Có streaming, memory, persona và settings UI.
- Dùng làm tham khảo về provider matrix và cấu hình model.

### Gần nhất với chức năng dịch và nút nổi theo selection

**Desktop Companion**  
Trang: <https://desktop.techdecoded.net/>  
Repository: <https://github.com/xShiroeNguyenx/desktop-companion>

- Live2D pet trên Windows.
- Khi chọn văn bản, hiện nút hoa cạnh con trỏ.
- Hỗ trợ dịch nhanh, soạn câu trả lời đa ngôn ngữ và lưu task.
- Có thể load model Live2D tùy chỉnh.
- Dùng Claude hoặc Gemini bằng key của người dùng.
- Đây là tham khảo UX sát nhất cho selection action, nhưng stack là Tauri chứ không phải C#/WinUI 3.

### Các lựa chọn AI desktop companion khác

- Desktop AI Companion: <https://dokk75.itch.io/desktop-ai-companion> — Windows, Live2D/VRM, screen vision, voice, memory, local/cloud models.
- AI Desktop Pet: <https://store.steampowered.com/app/4227700/AI_Desktop_Pet/> — Windows, local LLM, voice, vision và proactive dialogue.
- L2D Assistant: <https://github.com/TheCyaniteProject/l2d-assistant> — Live2D, STT, TTS và function calling; Electron/JavaScript.
- Komorebi: <https://github.com/kiskaserver/interactive_assistent> — Live2D, local/cloud AI, vision, speech và desktop actions; Tauri/Rust.
- Sato: <https://www.sato.host/> — macOS, pixel pet, chọn vùng màn hình và hỏi AI.
- GEIST: <https://heygeist.com/> — macOS, pet hiển thị trạng thái của Codex/Cursor/Claude agents.

### Microsoft Store

- Microsoft Store hiện có desktop pet trang trí như Pets Therapy: <https://apps.microsoft.com/detail/9p5n0cbksxmw>.
- eSheep cũng có Store listing: <https://apps.microsoft.com/detail/9MX2V0TQT6RM>.
- Trong lần khảo sát trước chưa xác minh được một app Microsoft Store kết hợp đầy đủ waifu/pet, radial assistant menu, model AI tùy chọn, dịch đa ngôn ngữ và kiến trúc mở rộng bằng C#.
- Đây là khoảng trống sản phẩm mà ứng dụng `mstore` có thể nhắm tới.

## Quyết định hiện tại

1. Không dùng repository `ecommerce-backend` để triển khai ứng dụng desktop.
2. Dùng WinUI 3/.NET 10 làm nền tảng sản phẩm mới.
3. Tham khảo VPet về pet interaction và extension concepts.
4. Tham khảo Desktop Companion về luồng select-text → floating action → translate/reply.
5. Thiết kế radial action menu thành capability cốt lõi, không gắn chặt vào AI provider.
6. Tách model/provider khỏi feature để dịch, chat, speech và vision có thể chọn backend độc lập.
7. Tái sử dụng `mstore core` tối đa trước khi tạo module mới.

## Rủi ro cần giải quyết sớm

- WinUI 3 không cung cấp sẵn mọi hành vi cho transparent click-through companion window; cần proof of concept cho hit testing, always-on-top, drag và multi-monitor DPI.
- Bắt selected text trên mọi ứng dụng Windows không đồng nhất. Ưu tiên clipboard/hotkey và UI Automation với fallback rõ ràng; tránh global hooks hoặc capability rộng khi không cần thiết.
- Live2D có SDK và điều khoản cấp phép riêng. Trước khi chọn làm định dạng chính cần kiểm tra quyền phân phối runtime và asset qua Microsoft Store.
- Local LLM, STT và TTS có thể làm MSIX lớn và tốn RAM/VRAM. Nên tách model download thành managed content sau cài đặt và cung cấp profile theo cấu hình máy.
- Native AOT hạn chế Reflection-based plugin loading. Extension system phải được thiết kế theo registry/source generation hoặc package contract đã kiểm soát.
- Screen capture, microphone và automation tác động đến Store review và niềm tin người dùng; manifest chỉ khai báo capability thực sự cần và UI giải thích theo từng tính năng.
- Always-on-top UI không được che nội dung, cướp focus hoặc làm hỏng thao tác bàn phím.

## Trình tự triển khai đề xuất trong project đích

1. Kiểm tra toàn bộ solution, `AGENTS.md`, `core` và convention hiện có.
2. Lập inventory các abstraction có thể tái sử dụng: MVVM, DI, logging, settings, localization, navigation, result types, Store và file I/O.
3. Tạo proof of concept nhỏ cho companion window: transparency, always-on-top, drag, click-through, multi-monitor và 200% scaling.
4. Chốt contract cho pet state machine và action registry.
5. Xây radial menu với keyboard navigation, screen reader và high contrast.
6. Tích hợp một translation pipeline cancellable, streaming và dùng provider abstraction.
7. Thêm settings live-apply, JSON localization live refresh và lưu atomic.
8. Thêm model/provider selection, credential storage và offline profile.
9. Thêm speech, vision và Windows automation theo từng capability sau khi MVP ổn định.
10. Chạy build, Native AOT analysis, accessibility checks, memory/leak checks và MSIX validation mà không thay đổi package identity hoặc Store association.

## Tiêu chí hoàn thành MVP

- Pet chạy ổn trên Windows 10/11 được Windows App SDK mục tiêu hỗ trợ.
- Hoạt động đúng với nhiều màn hình, DPI khác nhau và scaling 200%.
- Không cướp focus; click-through và interaction mode chuyển đổi chính xác.
- Radial menu sử dụng được bằng chuột, bàn phím và screen reader.
- Người dùng chọn văn bản hoặc dùng hotkey để dịch và hủy tác vụ đang chạy.
- Có ít nhất một provider offline hoặc local endpoint và một provider cloud có cấu hình.
- Đổi ngôn ngữ, model, persona, theme và các setting chính không cần restart.
- Settings ghi atomic và dữ liệu người dùng sống sót qua update.
- Không có secret trong source, settings JSON hoặc log.
- Build sạch, Native AOT analyzer không cảnh báo và toàn bộ JSON serialization dùng SourceGen.
- WAP/MSIX, identity, publisher, platform và Store association hiện hữu không bị thay đổi.

## Prompt khởi động cho task Codex mới

Sao chép đoạn dưới đây vào task mới sau khi mở đúng project đích:

> Đọc `AI_DESKTOP_COMPANION_HANDOFF.md`, toàn bộ `AGENTS.md`/`AGENTS.override.md` áp dụng và kiểm tra solution hiện tại. Mục tiêu là xây dựng AI desktop companion cho hệ sinh thái mstore bằng C# 14, .NET 10, WinUI 3 và Windows App SDK: pet/waifu always-on-top, menu thao tác nhanh dạng AssistiveTouch, kiến trúc action/provider mở rộng được, dịch đa ngôn ngữ và model AI local/cloud. Hãy bắt đầu bằng inventory `core` và các thành phần có thể tái sử dụng, sau đó triển khai vertical slice nhỏ nhất nhưng hoàn chỉnh gồm companion window, radial action menu và translation action. Tuân thủ Native AOT, JSON SourceGen, typed `{x:Bind}`, live settings/localization, cancellation và các giới hạn packaging trong tài liệu. Không sửa package identity, publisher, platform, Store association hoặc `.slnx`.

## Cách chuyển sang project khác trong Codex

Codex hiện không chuyển nguyên lịch sử của task này sang một project khác. Cách tiếp tục là:

1. Sao chép file này vào thư mục gốc của project đích.
2. Mở project đích trong Codex.
3. Tạo task mới.
4. Dán prompt ở mục trên và yêu cầu Codex đọc file handoff trước khi làm việc.

Handoff chỉ chuyển bối cảnh và quyết định; lịch sử cuộc trò chuyện gốc vẫn nằm trong task hiện tại.
