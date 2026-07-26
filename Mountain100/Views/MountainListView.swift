import SwiftUI

/// 百名山の一覧画面（検索・絞り込み・登頂チェック付き）
struct MountainListView: View {
    @Environment(MountainStore.self) private var store
    @State private var searchText = ""
    @State private var filter: VisitFilter = .all

    enum VisitFilter: String, CaseIterable, Identifiable {
        case all = "すべて"
        case visited = "登頂済み"
        case notVisited = "未登頂"

        var id: Self { self }
    }

    private var filteredMountains: [Mountain] {
        store.mountains.filter { mountain in
            switch filter {
            case .all:
                break
            case .visited:
                guard store.isVisited(mountain) else { return false }
            case .notVisited:
                guard !store.isVisited(mountain) else { return false }
            }
            guard !searchText.isEmpty else { return true }
            return mountain.name.localizedStandardContains(searchText)
                || mountain.kana.localizedStandardContains(searchText)
                || mountain.prefectures.contains { $0.localizedStandardContains(searchText) }
        }
    }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    ProgressHeaderView(visited: store.visitedCount, total: store.mountains.count)
                    Picker("表示", selection: $filter) {
                        ForEach(VisitFilter.allCases) { filter in
                            Text(filter.rawValue).tag(filter)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                Section {
                    ForEach(filteredMountains) { mountain in
                        MountainRowView(mountain: mountain)
                    }
                } footer: {
                    Text("\(filteredMountains.count)座を表示中")
                }
            }
            .navigationTitle("日本百名山")
            .navigationDestination(for: Mountain.self) { mountain in
                MountainDetailView(mountain: mountain)
            }
            .searchable(text: $searchText, prompt: "山名・読み・都道府県で検索")
        }
    }
}

/// 登頂数と進捗バーのヘッダー
struct ProgressHeaderView: View {
    let visited: Int
    let total: Int

    private var progress: Double {
        total > 0 ? Double(visited) / Double(total) : 0
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .firstTextBaseline) {
                Text("登頂記録")
                    .font(.headline)
                Spacer()
                Text("\(visited)")
                    .font(.title2.bold())
                    .foregroundStyle(.green)
                Text("/ \(total)座")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            ProgressView(value: progress)
                .tint(.green)
        }
        .padding(.vertical, 4)
    }
}

/// 一覧の1行（チェックボックス＋山の概要）
struct MountainRowView: View {
    @Environment(MountainStore.self) private var store
    let mountain: Mountain

    private var isVisited: Bool {
        store.isVisited(mountain)
    }

    var body: some View {
        NavigationLink(value: mountain) {
            HStack(spacing: 12) {
                Button {
                    withAnimation {
                        store.toggleVisited(mountain)
                    }
                } label: {
                    Image(systemName: isVisited ? "checkmark.square.fill" : "square")
                        .font(.title2)
                        .foregroundStyle(isVisited ? Color.green : Color.secondary)
                }
                .buttonStyle(.borderless)
                .accessibilityLabel(isVisited ? "登頂済み" : "未登頂")

                VStack(alignment: .leading, spacing: 2) {
                    HStack(alignment: .firstTextBaseline, spacing: 6) {
                        Text("\(mountain.id).")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .monospacedDigit()
                        Text(mountain.name)
                            .font(.headline)
                    }
                    Text("\(mountain.kana)｜\(mountain.prefecturesText)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Text(mountain.elevationText)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .monospacedDigit()
            }
        }
    }
}

#Preview {
    MountainListView()
        .environment(MountainStore())
}
