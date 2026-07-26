import SwiftUI

/// 山の詳細画面（登頂チェックの切り替えと基本情報）
struct MountainDetailView: View {
    @Environment(MountainStore.self) private var store
    let mountain: Mountain

    private var isVisitedBinding: Binding<Bool> {
        Binding(
            get: { store.isVisited(mountain) },
            set: { store.setVisited(mountain, $0) }
        )
    }

    var body: some View {
        List {
            Section {
                Toggle(isOn: isVisitedBinding) {
                    Label("登頂済み", systemImage: "figure.hiking")
                }
                .tint(.green)
            }

            Section("基本情報") {
                LabeledContent("No.", value: "\(mountain.id) / 100")
                LabeledContent("読み", value: mountain.kana)
                if let peak = mountain.highestPeak {
                    LabeledContent("最高峰", value: peak)
                }
                LabeledContent("標高", value: mountain.elevationText)
                LabeledContent("都道府県", value: mountain.prefecturesText)
                LabeledContent("山域", value: mountain.range)
            }
        }
        .navigationTitle(mountain.name)
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    NavigationStack {
        MountainDetailView(
            mountain: Mountain(
                id: 72,
                name: "富士山",
                kana: "ふじさん",
                highestPeak: "剣ヶ峰",
                elevationM: 3776,
                prefectures: ["静岡県", "山梨県"],
                range: "富士山"
            )
        )
    }
    .environment(MountainStore())
}
